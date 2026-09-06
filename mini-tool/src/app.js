(function () {
  "use strict";

  var SVG_NS = "http:" + "//www.w3.org/2000/svg";
  var VIEW_ITEMS = [
    { id: "guide", label: "导览" },
    { id: "timeline", label: "纪年" },
    { id: "people", label: "人物" },
    { id: "events", label: "事件" },
    { id: "atlas", label: "山河" }
  ];
  var LIST_PAGE_SIZE = 12;
  var dialogSequence = 0;

  function element(tagName, className, text) {
    var node = document.createElement(tagName);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function button(label, attributes) {
    var node = element("button", attributes.className || "", label);
    var key;
    node.type = "button";
    for (key in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, key) && key !== "className") node.setAttribute(key, attributes[key]);
    }
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function appendText(parent, tagName, className, text) {
    if (text) parent.appendChild(element(tagName, className, text));
  }

  function unique(values) {
    return values.filter(function (value, index) { return values.indexOf(value) === index; });
  }

  function findById(items, id) {
    var match = null;
    items.some(function (item) {
      if (item.id === id) { match = item; return true; }
      return false;
    });
    return match;
  }

  function atlasYears(data) {
    var atlas = data.atlas;
    if (!atlas || !atlas.years || !atlas.snapshots) return [];
    return Object.keys(atlas.years).map(Number).filter(function (year) {
      var snapshot = atlas.snapshots[atlas.years[year]];
      return year >= 907 && year <= data.meta.maxYear && snapshot && snapshot.regions && snapshot.regions.length;
    }).sort(function (a, b) { return a - b; });
  }

  function availableYear(year, years) {
    for (var i = 0; i < years.length; i++) if (years[i] >= year) return years[i];
    return years[years.length - 1];
  }

  function heading(title, eyebrow) {
    var group = element("div", "section-heading");
    if (eyebrow) group.appendChild(element("p", "eyebrow", eyebrow));
    var titleNode = element("h2", "view-title", title);
    titleNode.setAttribute("tabindex", "-1");
    group.appendChild(titleNode);
    return group;
  }

  function status(message, actionLabel, actionName, onAction) {
    var box = element("div", "empty-state");
    box.setAttribute("role", "status");
    box.appendChild(element("p", "empty-state__text", message));
    if (actionLabel) {
      var action = button(actionLabel, { className: "button button--primary", "data-action": actionName });
      action.addEventListener("click", onAction);
      box.appendChild(action);
    }
    return box;
  }

  function labelledValue(label, value) {
    var row = element("div", "detail-row");
    row.appendChild(element("h3", "detail-row__label", label));
    row.appendChild(element("p", "detail-row__value", value || "暂无补充说明"));
    return row;
  }

  function relatedNames(ids, items, formatter) {
    var names = [];
    (ids || []).forEach(function (id) {
      var item = findById(items || [], id);
      if (item) names.push(formatter ? formatter(item) : item.name || item.title);
    });
    return names.length ? names.join("、") : "暂无关联记录";
  }

  function openDialog(title, contentBuilder, opener) {
    document.dispatchEvent(new Event("mini-tool-pause"));
    var previous = document.querySelector('.dialog-backdrop:not([hidden])');
    var previousOverflow = document.body.style.overflow;
    if (previous) previous.hidden = true;
    document.body.style.overflow = "hidden";
    var backdrop = element("div", "dialog-backdrop");
    var dialog = element("section", "dialog");
    var top = element("div", "dialog__top");
    var titleNode = element("h2", "dialog__title", title);
    var closeButton = button("关闭", { className: "dialog__close", "data-action": "close-dialog", "aria-label": "关闭详情" });
    var closed = false;
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    titleNode.id = "dialog-title-" + (++dialogSequence);
    dialog.setAttribute("aria-labelledby", titleNode.id);
    top.appendChild(titleNode);
    top.appendChild(closeButton);
    dialog.appendChild(top);
    contentBuilder(dialog);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
    function closeDialog() {
      if (closed) return;
      closed = true;
      document.removeEventListener("keydown", onKeydown);
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      document.body.style.overflow = previousOverflow;
      if (previous) previous.hidden = false;
      if (opener && document.body.contains(opener)) opener.focus();
    }
    function onKeydown(event) {
      if (backdrop.hidden) return;
      if (event.key === "Escape" || event.keyCode === 27) closeDialog();
      if (event.key === "Tab") {
        var candidates = Array.prototype.filter.call(dialog.querySelectorAll('button, input, select, textarea, summary, [tabindex="0"]'), function (node) { return !node.disabled && node.getClientRects().length; });
        var first = candidates[0]; var last = candidates[candidates.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    closeButton.addEventListener("click", closeDialog);
    backdrop.addEventListener("click", function (event) { if (event.target === backdrop) closeDialog(); });
    document.addEventListener("keydown", onKeydown);
    closeButton.focus();
  }

  function renderTabs(state, setState) {
    var tabs = document.querySelector(".tabs");
    if (!tabs) return;
    clear(tabs);
    VIEW_ITEMS.forEach(function (item) {
      var tab = button(item.label, {
        className: "tab" + (state.view === item.id ? " tab--active" : ""),
        "data-view": item.id,
        "aria-current": state.view === item.id ? "page" : "false"
      });
      tab.addEventListener("click", function () { setState({ view: item.id }, true); });
      tabs.appendChild(tab);
    });
    var current = findById(VIEW_ITEMS, state.view) || VIEW_ITEMS[0];
    var live = element("span", "visually-hidden", "已打开" + current.label + "视图");
    live.setAttribute("aria-live", "polite");
    tabs.appendChild(live);
  }

  function renderGuide(root, data, setState) {
    var openingYear = data.meta.defaultYear || 936;
    var hero = element("section", "story-opening");
    hero.appendChild(element("p", "eyebrow", "从一个年份，走进五代十国"));
    hero.appendChild(element("p", "story-year", String(openingYear)));
    hero.appendChild(heading("一年之内，天下的边界为何被重新书写？", ""));
    hero.appendChild(element("p", "lede", "从一个年份出发，看清政权如何更替、人物如何选择，事件又如何推动下一次转折。"));
    var enter = button("进入 " + openingYear + " 年 →", { className: "button button--primary", "data-story-map": "" });
    enter.addEventListener("click", function () { setState({ view: "atlas", year: openingYear }, true); });
    hero.appendChild(enter);
    var person = findById(data.people, "shi-jingtang");
    if (person) {
      var personLink = button("从石敬瑭开始", { className: "text-button story-person", "data-story-person": person.id });
      personLink.addEventListener("click", function () { openPerson(person, data, personLink); });
      hero.appendChild(personLink);
    }
    root.appendChild(hero);
    if ((data.readingPaths || []).length) {
      var routes = element("section", "reading-routes");
      routes.appendChild(heading("不必先记住每一个年份", "从一条主线开始"));
      routes.appendChild(element("p", "lede", "选一个问题，跟随关键事件读下去；每一站都可以转向人物与地图。"));
      data.readingPaths.forEach(function (path) {
        var first = findById(data.events, path.eventIds[0]); if (!first) return;
        var card = element("article", "history-card");
        card.appendChild(element("p", "eyebrow", path.period + " · " + path.eventIds.length + " 站"));
        card.appendChild(element("h3", "history-card__title", path.title));
        card.appendChild(element("p", "muted", path.description));
        var start = button("开始阅读 →", { className: "text-button", "data-reading-path": path.id, "aria-label": "开始阅读：" + path.title });
        start.addEventListener("click", function () { openEvent(first, data, start, path); });
        card.appendChild(start); routes.appendChild(card);
      });
      root.appendChild(routes);
    }
    var paths = element("div", "path-grid");
    [
      { view: "timeline", mark: "01", title: "循年而读", text: "按年份查看同一时刻发生的关键事件。" },
      { view: "people", mark: "02", title: "因人入史", text: "从帝王、将领与重臣的经历理解选择。" },
      { view: "atlas", mark: "03", title: "沿山河看", text: "对照政权存续与重要地点的空间示意。" }
    ].forEach(function (path) {
      var card = button("", { className: "path-card", "data-guide-view": path.view, "aria-label": path.title + "：" + path.text });
      card.appendChild(element("span", "path-card__mark", path.mark));
      card.appendChild(element("strong", "path-card__title", path.title));
      card.appendChild(element("span", "path-card__text", path.text));
      card.addEventListener("click", function () { setState({ view: path.view }, true); });
      paths.appendChild(card);
    });
    root.appendChild(paths);
    var range = element("section", "paper-panel range-panel");
    range.appendChild(element("p", "eyebrow", "内容范围"));
    range.appendChild(element("p", "range-panel__years", "907—" + data.meta.maxYear));
    range.appendChild(element("p", "muted", "主体与地图：五代更替、十国并立至北宋统一。纪年另收录 875—906 年唐末前史，不提供该阶段地图。"));
    root.appendChild(range);
    var notes = element("section", "notice-panel");
    notes.appendChild(element("h3", "notice-panel__title", "阅读说明"));
    notes.appendChild(element("p", "", "内容来源：以传统正史、编年史及公开研究资料为线索整理，详情中的来源标签用于继续查考。"));
    notes.appendChild(element("p", "", "AI 边界：本工具运行时不使用生成式 AI，不进行在线问答；人物画像含艺术创作，具体参考与说明见人物详情。检索仅在包内历史资料中完成。"));
    notes.appendChild(element("p", "", "山河图为阅读辅助示意，不代表精确疆界；历史地名以现代地点作参照。"));
    root.appendChild(notes);
  }

  function eventCard(item, onOpen) {
    var card = element("article", "history-card event-card");
    var year = item.endYear && item.endYear !== item.startYear ? item.startYear + "—" + item.endYear : item.startYear;
    card.appendChild(element("p", "history-card__meta", year + " · " + eventTypeLabel(item.eventType)));
    card.appendChild(element("h3", "history-card__title", item.title));
    appendText(card, "p", "history-card__summary", item.summary);
    var open = button("查看事件", { className: "text-button", "data-event-id": item.id, "aria-label": "查看事件：" + item.title });
    open.addEventListener("click", function () { onOpen(item, open); });
    card.appendChild(open);
    return card;
  }

  function openEvent(item, data, opener, path) {
    openDialog(item.title, function (dialog) {
      if (!path) { eventDetails(dialog, item, data); return; }
      var stops = path.eventIds.map(function (id) { return findById(data.events, id); }).filter(Boolean);
      var index = stops.indexOf(item);
      function draw() {
        while (dialog.children.length > 1) dialog.removeChild(dialog.lastChild);
        var current = stops[index];
        dialog.querySelector(".dialog__title").textContent = current.title;
        var navigation = element("nav", "route-navigation");
        navigation.setAttribute("aria-label", path.title + "阅读进度");
        navigation.appendChild(element("p", "eyebrow", path.title + " · 第 " + (index + 1) + " / " + stops.length + " 站"));
        [-1, 1].forEach(function (step) {
          var next = stops[index + step];
          var control = button(step < 0 ? "← 上一站" : next ? "下一站 →" : "已到终点", { className: "chip", "data-route-step": step });
          control.disabled = !next;
          if (next) control.setAttribute("aria-label", (step < 0 ? "上一站：" : "下一站：") + next.title);
          control.addEventListener("click", function () {
            index += step; draw(); dialog.parentNode.scrollTop = 0;
            dialog.querySelector('[data-action="close-dialog"]').focus();
          });
          navigation.appendChild(control);
        });
        dialog.appendChild(navigation); eventDetails(dialog, current, data);
      }
      draw();
    }, opener);
  }

  function eventDetails(dialog, item, data) {
      dialog.appendChild(element("p", "dialog__meta", item.startYear + " · " + eventTypeLabel(item.eventType)));
      dialog.appendChild(labelledValue("背景", item.background));
      dialog.appendChild(labelledValue("经过", item.process));
      dialog.appendChild(labelledValue("结果", item.result));
      dialog.appendChild(labelledValue("影响", item.impact));
      dialog.appendChild(labelledValue("关联人物", relatedNames(item.personIds, data.people)));
      dialog.appendChild(labelledValue("关联政权", relatedNames(item.dynastyIds, data.dynasties)));
      dialog.appendChild(labelledValue("关联地点", relatedNames(item.locationIds, data.locations, function (location) {
        return location.name + (location.modernReference ? "（" + location.modernReference + "）" : "");
      })));
      dialog.appendChild(labelledValue("内容来源", item.sourceRefs && item.sourceRefs.length ? item.sourceRefs.join("；") : "资料整理，暂无单列条目"));
      if (item.disputedNote) dialog.appendChild(labelledValue("史料分歧", item.disputedNote));
      var peopleLinks = element("div", "person-actions");
      (item.personIds || []).forEach(function (id) {
        var person = findById(data.people, id); if (!person) return;
        var link = button("了解" + person.name, { className: "chip", "data-related-person": id });
        link.addEventListener("click", function () { openPerson(person, data, link); }); peopleLinks.appendChild(link);
      });
      dialog.appendChild(peopleLinks);
      if ((item.locationIds || []).length && atlasYears(data).indexOf(item.startYear) !== -1) {
        var mapLink = button("在 " + item.startYear + " 年地图中查看", { className: "text-button", "data-event-map": item.id });
        mapLink.addEventListener("click", function () {
          openDialog(item.title + " · 地图", function (mapDialog) {
            mapDialog.classList.add("dialog--map");
            var mapRoot = element("div", "event-map");
            var mapState = { atlasYear: item.startYear, year: item.startYear, atlasPolity: "", atlasZoom: 1, atlasX: 0, atlasY: 0, embedded: true };
            function updateMap(patch) {
              Object.keys(patch).forEach(function (key) { mapState[key] = patch[key]; });
              if (typeof patch.year === "number") mapState.atlasYear = patch.year;
              else mapState.year = mapState.atlasYear;
              clear(mapRoot); renderAtlas(mapRoot, data, mapState, updateMap);
            }
            mapDialog.appendChild(mapRoot); updateMap({});
          }, mapLink);
        });
        dialog.appendChild(mapLink);
      }
      (data.eventRelations || []).forEach(function (relation) {
        if (relation.sourceEventId !== item.id && relation.targetEventId !== item.id) return;
        var other = findById(data.events, relation.sourceEventId === item.id ? relation.targetEventId : relation.sourceEventId);
        if (!other) return;
        var label = relation.type === "context" ? "相关背景与后续发展" : relation.sourceEventId === item.id ? "直接后果" : "直接前因";
        appendText(dialog, "h3", "detail-row__label", label);
        dialog.appendChild(eventCard(other, function (event, opener) { openEvent(event, data, opener); }));
      });
  }

  function createSelect(labelText, fieldName, options, value, onChange) {
    var field = element("label", "field");
    var select = element("select", "field__control");
    field.appendChild(element("span", "field__label", labelText));
    select.setAttribute("data-field", fieldName);
    options.forEach(function (option) {
      var node = element("option", "", option.label);
      node.value = String(option.value);
      if (String(option.value) === String(value)) node.selected = true;
      select.appendChild(node);
    });
    select.addEventListener("change", onChange);
    field.appendChild(select);
    return field;
  }

  function yearControls(root, data, state, setState) {
    var mapMode = state.view === "atlas" || state.embedded;
    var years = mapMode ? atlasYears(data) : [];
    var minYear = mapMode ? years[0] : data.meta.minYear;
    var maxYear = mapMode ? years[years.length - 1] : data.meta.maxYear;
    var bar = element("div", "year-player" + (mapMode ? "" : " year-player--compact"));
    [-1, 1].forEach(function (step) {
      var control = button(step < 0 ? "上一年" : "下一年", { className: "year-step", "data-year-step": step });
      control.disabled = step < 0 ? state.atlasYear <= minYear : state.atlasYear >= maxYear;
      control.addEventListener("click", function () { setState({ year: mapMode ? years[years.indexOf(state.atlasYear) + step] : state.atlasYear + step, playing: false }); });
      bar.appendChild(control);
    });
    var label = element("label", "year-range");
    var value = element("strong", "", state.atlasYear + " 年");
    var slider = element("input", "");
    slider.type = "range"; slider.min = minYear; slider.max = maxYear; slider.value = state.atlasYear;
    slider.setAttribute("data-year-slider", ""); slider.setAttribute("aria-label", "历史年份");
    slider.addEventListener("input", function () { document.dispatchEvent(new Event("mini-tool-pause")); if (mapMode) slider.value = availableYear(Number(slider.value), years); value.textContent = slider.value + " 年"; });
    slider.addEventListener("change", function () { setState({ year: mapMode ? availableYear(Number(slider.value), years) : Number(slider.value), playing: false }); });
    label.appendChild(value); if (mapMode) label.appendChild(slider); bar.appendChild(label);
    var play = button(state.playing ? "暂停" : "播放", { className: "year-play", "data-action": "play-history", "aria-pressed": String(Boolean(state.playing)) });
    play.addEventListener("click", function () { setState({ playing: !state.playing, year: state.atlasYear >= maxYear ? minYear : state.atlasYear }); });
    if (!state.embedded) bar.appendChild(play);
    root.appendChild(bar);
  }

  function renderTimeline(root, data, state, setState) {
    root.appendChild(heading("把百年放在同一条线上", "纪年"));
    root.appendChild(element("p", "lede", "选择年份与线索，查看当年的关键转折。"));
    var controls = element("div", "filter-panel");
    var years = [{ value: "all", label: "全部年份" }];
    var year;
    for (year = data.meta.minYear; year <= data.meta.maxYear; year += 1) years.push({ value: year, label: year + " 年" });
    var tracks = unique([].concat.apply([], data.events.map(function (item) { return item.tracks || []; })));
    var subjects = tracks.filter(function (track) { return track !== "late-tang"; });
    var selected = state.selectedTracks || (state.track === "all" ? subjects : [state.track]);
    function trackMatches(item) {
      return (item.startYear < 907 && (item.tracks || []).indexOf("late-tang") !== -1) || (item.tracks || []).some(function (track) { return selected.indexOf(track) !== -1; });
    }
    var chips = element("div", "chip-row");
    chips.setAttribute("aria-label", "历史主体，可多选");
    subjects.forEach(function (track) {
      var enabled = selected.indexOf(track) !== -1;
      var chip = button(trackLabel(track), { className: "chip" + (enabled ? " chip--active" : ""), "data-track": track });
      chip.setAttribute("aria-pressed", String(enabled));
      chip.addEventListener("click", function () {
        var next = selected.length === subjects.length ? [track] : enabled ? selected.filter(function (value) { return value !== track; }) : selected.concat(track);
        setState({ selectedTracks: next, track: next.length === 1 ? next[0] : "all", timelineLimit: LIST_PAGE_SIZE });
      });
      chips.appendChild(chip);
    });
    root.appendChild(chips);
    yearControls(root, data, state, setState);
    var rail = element("div", "timeline-rail");
    rail.setAttribute("aria-label", "横向年份轨，有圆点的年份包含事件");
    var slots = [];
    for (year = data.meta.minYear; year <= data.meta.maxYear; year += 1) {
      var marked = data.events.some(function (item) { return trackMatches(item) && item.startYear <= year && (item.endYear || item.startYear) >= year; });
      var previous = slots[slots.length - 1];
      if (!marked && year !== state.year && previous && !previous.marked && previous.end !== state.year) previous.end = year;
      else slots.push({ start: year, end: year, marked: marked });
    }
    slots.forEach(function (slot) {
      var label = slot.start === slot.end ? String(slot.start) : slot.start + "–" + slot.end;
      var tick = button(label, { className: "timeline-tick" + (slot.marked ? " timeline-tick--marked" : ""), "data-rail-year": slot.start });
      tick.setAttribute("aria-label", label + " 年" + (slot.marked ? "，有事件" : "，暂无事件"));
      if (slot.start === state.year) tick.setAttribute("aria-current", "date");
      tick.addEventListener("click", function () { setState({ year: slot.start, playing: false, timelineLimit: LIST_PAGE_SIZE }); });
      rail.appendChild(tick);
    });
    root.appendChild(rail);
    window.requestAnimationFrame(function () {
      var current = rail.querySelector('[aria-current="date"]');
      if (current) rail.scrollLeft = current.offsetLeft - (rail.clientWidth - current.offsetWidth) / 2;
    });
    controls.appendChild(createSelect("年份", "year", years, state.year, function (event) { setState({ year: event.target.value === "all" ? "all" : Number(event.target.value), timelineLimit: LIST_PAGE_SIZE }); }));
    controls.appendChild(createSelect("线索", "track", [{ value: "all", label: "全部线索" }].concat(tracks.map(function (track) { return { value: track, label: trackLabel(track) }; })), state.track, function (event) { setState({ track: event.target.value, selectedTracks: null, timelineLimit: LIST_PAGE_SIZE }); }));
    var precision = element("details", "timeline-precision");
    precision.appendChild(element("summary", "", "精确筛选 · 全部年份"));
    precision.appendChild(controls);
    root.appendChild(precision);
    var matches = data.events.filter(function (item) {
      var yearMatches = state.year === "all" || item.startYear === state.year || (item.endYear && item.startYear <= state.year && item.endYear >= state.year);
      return yearMatches && trackMatches(item);
    });
    if (!matches.length) {
      root.appendChild(status("这一年没有找到符合当前线索的事件。", "查看全部事件", "show-all-events", function () { setState({ year: "all", track: "all", selectedTracks: null, timelineLimit: LIST_PAGE_SIZE }); }));
      return;
    }
    var list = element("div", "card-list");
    matches.slice(0, state.timelineLimit).forEach(function (item) {
      list.appendChild(eventCard(item, function (selected, opener) { openEvent(selected, data, opener); }));
    });
    root.appendChild(list);
    if (matches.length > state.timelineLimit) {
      var moreTimeline = button("加载更多", { className: "button button--primary", "data-action": "load-more-timeline" });
      moreTimeline.addEventListener("click", function () { setState({ timelineLimit: state.timelineLimit + LIST_PAGE_SIZE }); });
      root.appendChild(moreTimeline);
    }
  }

  function categoryLabel(category) {
    var labels = { "five-dynasties": "五代", "ten-kingdoms": "十国", neighbor: "周边政权", transition: "统一过渡" };
    return labels[category] || category;
  }

  function trackLabel(track) {
    var labels = { "late-tang": "晚唐余波", "five-dynasties": "五代主线", "ten-kingdoms": "十国并立", "liao-north": "辽与北方", "song-unification": "宋初统一" };
    return labels[track] || track;
  }

  function eventTypeLabel(eventType) {
    var labels = { founding: "政权建立", collapse: "政权灭亡", war: "战争", succession: "皇位变化", political: "政治事件" };
    return labels[eventType] || eventType;
  }

  function renderChips(values, selected, attribute, onSelect, labeler) {
    var group = element("div", "chip-row");
    values.forEach(function (value) {
      var label = value === "all" ? "全部" : labeler(value);
      var attributes = { className: "chip" + (selected === value ? " chip--active" : "") };
      attributes[attribute] = value;
      var chip = button(label, attributes);
      chip.setAttribute("aria-pressed", selected === value ? "true" : "false");
      chip.addEventListener("click", function () { onSelect(value); });
      group.appendChild(chip);
    });
    return group;
  }

  function portraitFigure(item, detail) {
    if (!item.portrait || !item.portrait.src) return null;
    var figure = element("figure", detail ? "portrait portrait--detail" : "portrait");
    var image = element("img", "portrait__image");
    image.src = item.portrait.src;
    image.alt = item.name + "人物画像（艺术创作）";
    image.width = 240;
    image.height = 320;
    figure.appendChild(image);
    if (detail) {
      figure.appendChild(element("figcaption", "portrait__caption", "人物画像 · 艺术创作，非真实容貌复原。"));
      appendText(figure, "p", "portrait__caption", item.portrait.note);
      appendText(figure, "p", "portrait__caption", item.portrait.sourceTitle ? "参考来源：" + item.portrait.sourceTitle : "");
    } else {
      figure.appendChild(element("figcaption", "portrait__badge", "艺术创作"));
    }
    return figure;
  }

  function personExperience(dialog, item, data, profile) {
    function inPerson(text) { return (text || "").split(item.name).join("我"); }
    function lifeAnswer() {
      var life = inPerson(item.biography || item.summary).replace(/(^|[。！？])他/g, "$1我");
      return "我是" + item.name + "，" + ((item.roles || [])[0] || "那个时代的一员") + "。\n\n" + life + (item.disputedNote ? "\n\n不过，记载有分歧：" + item.disputedNote : "") + "\n\n你想从哪一段往事聊起？";
    }
    var navigation = element("div", "person-actions");
    var content = element("div", "person-content");
    var draft = "介绍一下你的生平";
    var messages = [];
    var selectedEvent = null;
    var ownEvents = data.events.filter(function (event) { return (event.personIds || []).indexOf(item.id) !== -1; });
    function renderLog(log) {
      clear(log);
      messages.forEach(function (message) {
        var turn = element("div", "demo-turn");
        var user = element("article", "message message--user");
        appendText(user, "p", "message__name", "你");
        appendText(user, "p", "message__bubble", message.question);
        var answer = element("article", "message message--person");
        appendText(answer, "p", "message__name", item.name);
        appendText(answer, "p", "message__bubble", message.answer);
        appendText(answer, "p", "message__kind", message.kind);
        if (message.sources) {
          var refs = element("details", "message__sources");
          refs.appendChild(element("summary", "", "资料来源"));
          appendText(refs, "p", "", message.sources);
          answer.appendChild(refs);
        }
        turn.appendChild(user); turn.appendChild(answer);
        log.appendChild(turn);
      });
      log.scrollTop = log.scrollHeight;
      if (typeof requestAnimationFrame === "function") requestAnimationFrame(function () { log.scrollTop = log.scrollHeight; });
    }
    function show(panel) {
      dialog.classList.toggle("dialog--chat", panel !== "profile");
      dialog.querySelector(".dialog__title").textContent = panel === "demo" ? "与" + item.name + "对话" : item.name;
      content.classList.toggle("person-content--chat", panel === "demo");
      if (dialog.parentNode) dialog.parentNode.scrollTop = 0;
      clear(content);
      Array.prototype.forEach.call(navigation.children, function (control) {
        control.setAttribute("aria-pressed", String(control.getAttribute("data-person-panel") === panel));
      });
      if (panel === "profile") { profile(content); return; }
      if (panel === "prompt") {
        appendText(content, "h3", "detail-row__label", "把人物设定带去其他 AI 工具");
        appendText(content, "p", "fine-print", "先选中全文，再使用设备提供的复制操作。部分容器可能不提供复制菜单；选中不代表已复制。");
        var prompt = element("textarea", "person-prompt");
        prompt.readOnly = true;
        prompt.rows = 12;
        prompt.setAttribute("aria-label", item.name + "人物提示词");
        prompt.value = item.prompt || "此人物提示词尚未收录。";
        var select = button("选中全部", { className: "button", "data-action": "select-prompt" });
        select.addEventListener("click", function () { prompt.focus(); prompt.select(); prompt.setSelectionRange(0, prompt.value.length); });
        content.appendChild(select);
        content.appendChild(prompt);
        return;
      }
      appendText(content, "p", "chat-hint", "依据史料的角色演绎，非本人发言或史料原文。离线回答，不接入实时 AI。");
      var log = element("div", "demo-log");
      log.setAttribute("tabindex", "0");
      log.setAttribute("data-welcome", "你好，我是" + item.name + "。想聊我的经历，还是想问一个当年的选择？");
      log.setAttribute("role", "log");
      log.setAttribute("aria-label", "与" + item.name + "对话");
      log.setAttribute("aria-live", "polite");
      renderLog(log);
      content.appendChild(log);
      var composer = element("div", "chat-composer");
      var topics = element("details", "chat-topics");
      topics.open = false;
      topics.appendChild(element("summary", "", "换个话题"));
      var questions = element("div", "person-actions");
      var followups = element("div", "person-actions");
      function reply(question, answer, sources, adapted) {
        draft = ""; input.value = ""; send.disabled = true;
        messages.push({ question: question, answer: answer, sources: (sources || []).join("；"), kind: adapted ? "角色演绎，非历史原话" : "资料说明" });
        if (messages.length > 12) messages.shift();
        renderLog(log);
        topics.open = false;
      }
      function eventReply(event, field, label) {
        var adapted = data.personDialogues && data.personDialogues[item.id] && data.personDialogues[item.id][event.id];
        var text = adapted && adapted[field];
        var lead = { summary: "这件事，要从这里说起。", background: "要说缘由，得先看当时的处境。", process: "事情是这样发生的。", result: "说到后来的结果，", impact: "这件事的影响还在后头。" };
        reply(event.title + " · " + label, (text || lead[field] + "\n\n" + inPerson(event[field])) + (event.disputedNote ? "\n\n不过，记载有分歧：" + event.disputedNote : ""), event.sourceRefs, true);
      }
      function renderFollowups() {
        clear(followups);
        if (!selectedEvent) return;
        [["background", "为什么发生"], ["process", "事情经过"], ["result", "后来结果"], ["impact", "历史影响"]].forEach(function (field) {
          if (!selectedEvent[field[0]]) return;
          var question = button(field[1], { className: "chip", "data-demo-field": field[0] });
          question.addEventListener("click", function () { eventReply(selectedEvent, field[0], field[1]); });
          followups.appendChild(question);
        });
      }
      [["life", "讲讲你的生平"], ["boundary", "这些回答可信吗？"]].forEach(function (entry) {
        var question = button(entry[1], { className: "chip", "data-demo-question": entry[0] });
        question.addEventListener("click", function () {
          selectedEvent = null;
          var selector = content.querySelector('[data-field="demo-event"]');
          if (selector) selector.value = "";
          renderFollowups();
          reply(entry[1], entry[0] === "life" ? lifeAnswer() : "我是" + item.name + "的角色演绎，用已有史料与你交谈，并不是真实人物。记载之外的事，我不能随口编一个答案。", item.sourceRefs, true);
        });
        questions.appendChild(question);
      });
      topics.appendChild(questions);
      if (ownEvents.length) {
        topics.appendChild(createSelect("更多往事", "demo-event", [{ value: "", label: "请选择事件" }].concat(ownEvents.map(function (event) { return { value: event.id, label: event.startYear + " · " + event.title }; })), selectedEvent ? selectedEvent.id : "", function (event) {
          selectedEvent = findById(ownEvents, event.target.value);
          renderFollowups();
          if (selectedEvent) eventReply(selectedEvent, "summary", "聊聊这件事");
        }));
        ownEvents.slice(0, 3).forEach(function (event) {
          var question = button(event.title, { className: "chip", "data-demo-question": event.id });
          question.addEventListener("click", function () {
            selectedEvent = event;
            content.querySelector('[data-field="demo-event"]').value = event.id;
            renderFollowups();
            eventReply(event, "summary", "聊聊这件事");
          });
          questions.appendChild(question);
        });
      } else appendText(topics, "p", "fine-print", "此人物暂无收录的关联事件。");
      renderFollowups();
      composer.appendChild(followups);
      composer.appendChild(topics);
      var input = element("textarea", "chat-input");
      input.rows = 2; input.maxLength = 1000; input.placeholder = "接着问一句……";
      input.setAttribute("data-chat-input", ""); input.setAttribute("aria-label", "想对" + item.name + "说的话");
      var send = button("发送", { className: "button button--primary", "data-chat-send": "" });
      input.value = draft;
      send.disabled = !draft.trim();
      var selectDefault = draft === "介绍一下你的生平";
      input.addEventListener("focus", function () { if (selectDefault) { input.select(); selectDefault = false; } });
      input.addEventListener("input", function () { draft = input.value; selectDefault = false; send.disabled = !input.value.trim(); });
      function sendMessage() {
        var question = input.value.trim(); if (!question) return;
        input.value = ""; send.disabled = true;
        if (/生平|经历|你是谁|介绍.*你/.test(question)) reply(question, lifeAnswer(), item.sourceRefs, true);
        else if (/^(你好|您好|嗨|在吗)[！!？?。]*$/.test(question)) reply(question, "你好，我是" + item.name + "。想聊我的经历，还是想问一个当年的选择？", [], true);
        else if (/^(谢谢|多谢|好的|明白了)[！!。]*$/.test(question)) reply(question, "不客气。还有哪一段往事，是你想知道的？", [], true);
        else if (/心里|后悔|秘密|最喜欢/.test(question)) reply(question, "这件事我说不准。记载能告诉你我做了什么，却不能证明当时心里每一个念头。我们可以聊聊当时的处境。", [], true);
        else {
          var event = ownEvents.filter(function (candidate) { return question.indexOf(candidate.title) !== -1; })[0];
          if (!event && /为什么|为何|后来|经过|影响|结果|继续/.test(question)) event = selectedEvent;
          if (event) {
            selectedEvent = event;
            var field = /为什么|为何|原因/.test(question) ? "background" : /影响|后果/.test(question) ? "impact" : /结果|后来/.test(question) ? "result" : /经过|如何|继续/.test(question) ? "process" : "summary";
            eventReply(event, field, question); messages[messages.length - 1].question = question; renderLog(log); renderFollowups();
          } else reply(question, "这个问题我还说不准，没有找到足够的记载，不能随口编一个答案。你可以问我的生平，或从“换个话题”中选一件往事，我们接着聊。", [], true);
        }
        input.focus();
      }
      send.addEventListener("click", sendMessage);
      input.addEventListener("keydown", function (event) { if (event.key === "Enter" && !event.shiftKey && !event.isComposing && event.keyCode !== 229) { event.preventDefault(); sendMessage(); } });
      var inputRow = element("div", "chat-input-row"); inputRow.appendChild(input); inputRow.appendChild(send); composer.appendChild(inputRow);
      var reset = button("重新开始", { className: "text-button", "data-action": "clear-demo" });
      reset.addEventListener("click", function () {
        messages = []; selectedEvent = null;
        draft = "介绍一下你的生平"; input.value = draft; send.disabled = false; selectDefault = true;
        var selector = content.querySelector('[data-field="demo-event"]');
        if (selector) selector.value = "";
        renderLog(log); renderFollowups();
        topics.open = false;
      });
      composer.appendChild(reset);
      appendText(composer, "p", "chat-hint", "Enter 发送 · Shift+Enter 换行 · 最近 12 轮");
      content.appendChild(composer);
    }
    [["profile", "人物小传"], ["demo", "与他对话"], ["prompt", "查看人物提示词"]].forEach(function (entry) {
      var control = button(entry[1], { className: "chip", "data-person-panel": entry[0] });
      control.addEventListener("click", function () { show(entry[0]); });
      navigation.appendChild(control);
    });
    dialog.appendChild(navigation);
    dialog.appendChild(content);
    show("profile");
  }

  function openPerson(item, data, opener) {
    openDialog(item.name, function (dialog) {
      var visited = [];
      function detachBody() { while (dialog.children.length > 1) dialog.removeChild(dialog.lastChild); }
      function focusPerson(next, source) {
        visited.push({ nodes: Array.prototype.slice.call(dialog.children, 1), title: dialog.querySelector(".dialog__title").textContent, scroll: dialog.parentNode.scrollTop, source: source });
        detachBody(); draw(next); dialog.parentNode.scrollTop = 0;
        dialog.querySelector('[data-action="back-person"]').focus();
      }
      function draw(item) {
      dialog.querySelector(".dialog__title").textContent = item.name;
      if (visited.length) {
        var back = button("← 返回上一人物", { className: "text-button person-back", "data-action": "back-person" });
        back.addEventListener("click", function () {
          var previous = visited.pop(); detachBody();
          dialog.classList.remove("dialog--chat");
          dialog.querySelector(".dialog__title").textContent = previous.title;
          previous.nodes.forEach(function (node) { dialog.appendChild(node); });
          previous.source.focus(); dialog.parentNode.scrollTop = previous.scroll;
        });
        dialog.appendChild(back);
      }
      personExperience(dialog, item, data, function (content) {
        appendText(content, "p", "eyebrow", "以 " + item.name + " 为中心 · 全生平关系");
        appendText(content, "p", "dialog__meta", (item.roles || []).join(" · "));
        var portrait = portraitFigure(item, true); if (portrait) content.appendChild(portrait);
        content.appendChild(labelledValue("人物小传", item.biography || item.summary));
        if (item.aliases && item.aliases.length) content.appendChild(labelledValue("别名", item.aliases.join("、")));
        content.appendChild(labelledValue("所属政权", relatedNames(item.dynastyIds, data.dynasties)));
        if (item.disputedNote) content.appendChild(labelledValue("史料异说", item.disputedNote));
        appendText(content, "h3", "detail-row__label", "生平事件");
        var lifeEvents = data.events.filter(function (event) { return (event.personIds || []).indexOf(item.id) !== -1; });
        if (!lifeEvents.length) appendText(content, "p", "muted", "暂无关联记录");
        lifeEvents.forEach(function (event) {
          content.appendChild(eventCard(event, function (selected, source) { openEvent(selected, data, source); }));
        });
        var labels = { family: "亲属", ally: "盟友", enemy: "敌人", "ruler-subject": "君臣", political: "政治关系", succession: "继承" };
        appendText(content, "h3", "detail-row__label", "关系中的人 · 全生平");
        (data.personRelations || []).forEach(function (relation) {
          if (relation.sourcePersonId !== item.id && relation.targetPersonId !== item.id) return;
          var other = findById(data.people, relation.sourcePersonId === item.id ? relation.targetPersonId : relation.sourcePersonId); if (!other) return;
          var card = element("section", "relation-card");
          var link = button((labels[relation.type] || relation.type) + " · " + other.name + " →", { className: "text-button", "data-related-person": other.id });
          link.addEventListener("click", function () { focusPerson(other, link); });
          card.appendChild(link); appendText(card, "p", "", relation.description);
          appendText(card, "p", "fine-print", (relation.sourceRefs || []).join("；")); content.appendChild(card);
        });
      });
      }
      draw(item);
    }, opener);
  }

  function renderPeople(root, data, state, setState) {
    root.appendChild(heading("从一个人，看见一张关系网", "人物"));
    var searchLabel = element("label", "search-field");
    var search = element("input", "search-field__input");
    search.type = "search";
    search.placeholder = "搜索姓名、别名或身份";
    search.value = state.personQuery;
    search.setAttribute("data-field", "person-search");
    searchLabel.appendChild(element("span", "visually-hidden", "搜索人物"));
    searchLabel.appendChild(search);
    var isComposing = false;
    function commitSearch(nextValue) {
      setState({ personQuery: nextValue, peopleLimit: LIST_PAGE_SIZE });
      var nextSearch = root.querySelector('[data-field="person-search"]');
      if (nextSearch) {
        nextSearch.focus();
        nextSearch.setSelectionRange(nextValue.length, nextValue.length);
      }
    }
    search.addEventListener("compositionstart", function () { isComposing = true; });
    search.addEventListener("compositionend", function (event) {
      isComposing = false;
      commitSearch(event.target.value);
    });
    search.addEventListener("input", function (event) {
      if (isComposing || event.isComposing) return;
      commitSearch(event.target.value);
    });
    root.appendChild(searchLabel);
    var categories = unique(data.dynasties.map(function (item) { return item.category; }));
    var filters = element("details", "people-filters");
    filters.appendChild(element("summary", "fine-print", "按政权范围找人"));
    filters.appendChild(renderChips(["all"].concat(categories), state.personCategory, "data-category", function (value) { setState({ personCategory: value, peopleLimit: LIST_PAGE_SIZE }); }, categoryLabel));
    root.appendChild(filters);
    var dynastyById = {};
    data.dynasties.forEach(function (item) { dynastyById[item.id] = item; });
    var query = state.personQuery.toLowerCase().replace(/^\s+|\s+$/g, "");
    var matches = data.people.filter(function (item) {
      var searchable = [item.name].concat(item.aliases || [], item.roles || []).join(" ").toLowerCase();
      var categoryMatches = state.personCategory === "all" || (item.dynastyIds || []).some(function (id) { return dynastyById[id] && dynastyById[id].category === state.personCategory; });
      return categoryMatches && (!query || searchable.indexOf(query) !== -1);
    });
    if (!matches.length) {
      root.appendChild(status("没有找到符合条件的人物。", "清除搜索", "clear-search", function () { setState({ personQuery: "", personCategory: "all" }); }));
      return;
    }
    function focusPerson(id) {
      setState({ centerPerson: id, previousPerson: center.id, personQuery: "", personCategory: "all" });
      var focused = root.querySelector('[data-graph-person="' + id + '"]');
      if (focused && focused.focus) focused.focus();
    }
    var center = findById(matches, state.centerPerson) || findById(matches, "shi-jingtang") || matches[0];
    if (query || state.personCategory !== "all") {
      var results = element("div", "people-results");
      results.appendChild(element("p", "fine-print", "找到 " + matches.length + " 位人物，点选后以其为中心探索"));
      matches.slice(0, state.peopleLimit).forEach(function (person) {
        var choice = button(person.name, { className: "chip", "data-focus-person": person.id });
        choice.addEventListener("click", function () { focusPerson(person.id); }); results.appendChild(choice);
      });
      root.appendChild(results);
      if (matches.length > state.peopleLimit) {
        var morePeople = button("更多搜索结果", { className: "text-button", "data-action": "load-more-people" });
        morePeople.addEventListener("click", function () { setState({ peopleLimit: state.peopleLimit + LIST_PAGE_SIZE }); }); root.appendChild(morePeople);
      }
    }
    if (state.previousPerson && state.previousPerson !== center.id) {
      var previousPerson = findById(data.people, state.previousPerson);
      if (previousPerson) {
        var back = button("← 返回" + previousPerson.name, { className: "text-button" });
        back.addEventListener("click", function () { focusPerson(previousPerson.id); }); root.appendChild(back);
      }
    }
    renderPersonGraph(root, data, center, focusPerson);
    var list = element("div", "person-center-detail");
    [center].forEach(function (item) {
      var card = element("article", "history-card person-card");
      var portrait = portraitFigure(item, false);
      if (portrait) card.appendChild(portrait);
      var body = element("div", "person-card__body");
      appendText(body, "p", "history-card__meta", (item.roles || []).join(" · "));
      body.appendChild(element("h3", "history-card__title", item.name));
      appendText(body, "p", "history-card__summary", item.summary);
      var open = button("阅读小传", { className: "text-button", "data-person-id": item.id, "aria-label": "阅读" + item.name + "小传" });
      open.addEventListener("click", function () {
        openPerson(item, data, open);
      });
      body.appendChild(open);
      card.appendChild(body);
      list.appendChild(card);
    });
    root.appendChild(list);
  }

  function renderPersonGraph(root, data, center, onFocus) {
    var relations = (data.personRelations || []).filter(function (relation) { return relation.sourcePersonId === center.id || relation.targetPersonId === center.id; });
    var ids = unique(relations.map(function (relation) { return relation.sourcePersonId === center.id ? relation.targetPersonId : relation.sourcePersonId; })).filter(function (id) { return id !== center.id && findById(data.people, id); });
    var radiusY = 135 + Math.max(0, ids.length - 6) * 22;
    var centerY = radiusY + 50;
    var labels = { family: "亲属", ally: "盟友", enemy: "敌人", "ruler-subject": "君臣", political: "政治关系", succession: "继承" };
    var section = element("section", "person-network");
    section.setAttribute("data-person-graph", "");
    section.appendChild(element("p", "fine-print", center.name + " · 全生平一度关系 · " + ids.length + " 位关联人物"));
    var svg = svgNode("svg", { viewBox: "0 0 360 " + (radiusY * 2 + 120), role: "group", "aria-label": center.name + "人物关系网", "data-graph-center": center.id });
    var positions = ids.map(function (id, index) { var angle = -Math.PI / 2 + index * Math.PI * 2 / ids.length; return { id: id, x: 180 + Math.cos(angle) * 135, y: centerY + Math.sin(angle) * radiusY }; });
    positions.forEach(function (position) {
      svg.appendChild(svgNode("line", { x1: 180, y1: centerY, x2: position.x, y2: position.y, stroke: "#b79755", "stroke-width": 1.2 }));
      var types = unique(relations.filter(function (relation) { return relation.sourcePersonId === position.id || relation.targetPersonId === position.id; }).map(function (relation) { return labels[relation.type] || relation.type; })).join("·");
      var x = (180 + position.x) / 2, y = (centerY + position.y) / 2;
      svg.appendChild(svgNode("rect", { x: x - 34, y: y - 9, width: 68, height: 18, rx: 5, fill: "#f3f0e7" }));
      svg.appendChild(svgNode("text", { x: x, y: y + 4, "text-anchor": "middle", fill: "#6e716b", "font-size": 11 }, types));
    });
    [{ id: center.id, x: 180, y: centerY }].concat(positions).forEach(function (position) {
      var person = findById(data.people, position.id), isCenter = person.id === center.id;
      var node = svgNode("g", { role: "button", tabindex: 0, "data-graph-person": person.id, "aria-label": isCenter ? "阅读" + person.name + "小传" : "以" + person.name + "为中心", class: "person-network__node" });
      node.appendChild(svgNode("circle", { cx: position.x, cy: position.y, r: 31, fill: isCenter ? "#9f4036" : "#fffaf1", stroke: isCenter ? "#9f4036" : "#b79755", "stroke-width": 2 }));
      if (person.portrait && person.portrait.src) {
        var clip = svgNode("clipPath", { id: "person-clip-" + person.id });
        clip.appendChild(svgNode("circle", { cx: position.x, cy: position.y, r: 27 })); svg.appendChild(clip);
        var portrait = svgNode("image", { x: position.x - 27, y: position.y - 27, width: 54, height: 54, preserveAspectRatio: "xMidYMin slice", "clip-path": "url(#person-clip-" + person.id + ")" });
        portrait.setAttribute("href", person.portrait.src); node.appendChild(portrait);
      } else node.appendChild(svgNode("text", { x: position.x, y: position.y + 7, "text-anchor": "middle", fill: isCenter ? "#fffaf1" : "#172824", "font-size": 20 }, person.name.slice(0, 1)));
      node.appendChild(svgNode("text", { x: position.x, y: position.y + 48, "text-anchor": "middle", fill: "#172824", "font-size": 15 }, person.name));
      function activate() { if (isCenter) openPerson(person, data, node); else onFocus(person.id); }
      node.addEventListener("click", activate);
      node.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
      svg.appendChild(node);
    });
    section.appendChild(svg);
    section.appendChild(element("p", "fine-print", ids.length ? "点选周围人物切换中心，点中心头像阅读小传。画像为艺术创作；关系按全生平展示，不限于当前年份。" : "暂无已收录关系，可搜索其他人物继续探索。"));
    root.appendChild(section);
  }

  function renderEvents(root, data, state, setState) {
    root.appendChild(heading("从关键转折理解格局", "事件"));
    root.appendChild(element("p", "lede", "按事件类型筛选，展开查看背景、经过与影响。"));
    var types = unique(data.events.map(function (item) { return item.eventType; }));
    root.appendChild(renderChips(["all"].concat(types), state.eventType, "data-event-type", function (value) { setState({ eventType: value, eventsLimit: LIST_PAGE_SIZE }); }, eventTypeLabel));
    var matches = data.events.filter(function (item) { return state.eventType === "all" || item.eventType === state.eventType; });
    if (!matches.length) {
      root.appendChild(status("没有找到这一类型的事件。", "查看全部类型", "show-all-event-types", function () { setState({ eventType: "all" }); }));
      return;
    }
    var list = element("div", "card-list");
    matches.slice(0, state.eventsLimit).forEach(function (item) {
      list.appendChild(eventCard(item, function (selected, opener) { openEvent(selected, data, opener); }));
    });
    root.appendChild(list);
    if (matches.length > state.eventsLimit) {
      var moreEvents = button("加载更多", { className: "button button--primary", "data-action": "load-more-events" });
      moreEvents.addEventListener("click", function () { setState({ eventsLimit: state.eventsLimit + LIST_PAGE_SIZE }); });
      root.appendChild(moreEvents);
    }
  }

  function svgNode(tagName, attributes, text) {
    var node = document.createElementNS(SVG_NS, tagName);
    Object.keys(attributes).forEach(function (key) { node.setAttribute(key, attributes[key]); });
    if (text) node.textContent = text;
    return node;
  }

  function renderAtlas(root, data, state, setState) {
    root.appendChild(heading("看见同一年的山河", "山河"));
    var atlas = data.atlas;
    var validYears = atlasYears(data);
    if (!atlas || !atlas.years || !atlas.snapshots || !atlas.paths || !validYears.length) {
      root.appendChild(status("历史地图资料未载入，暂时无法展示疆域。"));
      return;
    }
    state.atlasYear = availableYear(state.atlasYear, validYears);
    state.year = state.atlasYear;
    yearControls(root, data, state, setState);
    var years = validYears.map(function (year) { return { value: year, label: year + " 年" }; });
    var controls = element("details", "atlas-year-picker");
    controls.appendChild(element("summary", "", "精确选择年份"));
    controls.appendChild(createSelect("查看年份", "atlas-year", years, state.atlasYear, function (event) { setState({ atlasYear: Number(event.target.value), atlasPolity: "" }); }));
    root.appendChild(controls);
    var snapshot = atlas.snapshots[atlas.years[state.atlasYear]];
    var regions = snapshot ? snapshot.regions : [];
    if (!snapshot) root.appendChild(status("这一年尚无疆域阶段资料，仅展示自然地理背景。可选择 907—979 年查看历史疆域。"));
    else root.appendChild(element("p", "atlas__stage", snapshot.startYear + "—" + snapshot.endYear + " 年末格局 · 点击政权查看详情"));
    var figure = element("figure", "atlas");
    var box = atlas.viewBox;
    var suppressMapClickUntil = 0;
    var svg = svgNode("svg", { viewBox: box.join(" "), role: "group", "aria-label": state.atlasYear + "年政权与重要地点示意图", preserveAspectRatio: "xMidYMid meet" });
    svg.appendChild(svgNode("path", { d: atlas.landPath, class: "atlas__land", "fill-rule": "evenodd" }));
    function openPolity(region, opener) {
      var dynasty = findById(data.dynasties, region.dynastyId);
      state.atlasPolity = region.id;
      var paths = svg.querySelectorAll("[data-region-id]");
      Array.prototype.forEach.call(paths, function (path) {
        var selected = path.getAttribute("data-region-id") === region.id;
        path.setAttribute("class", "atlas__region" + (selected ? " atlas__region--selected" : ""));
        path.setAttribute("aria-pressed", selected ? "true" : "false");
      });
      openDialog(region.name, function (dialog) {
        dialog.appendChild(element("p", "dialog__meta", state.atlasYear + " 年 · " + (dynasty ? categoryLabel(dynasty.category) : "历史政权")));
        if (dynasty) {
          dialog.appendChild(labelledValue("存续时间", dynasty.startYear + "—" + dynasty.endYear));
          dialog.appendChild(labelledValue("政权概况", dynasty.summary));
          dialog.appendChild(labelledValue("都城", dynasty.capital || "未收录"));
          appendText(dialog, "h3", "detail-row__label", "年末君主");
          var rulers = (dynasty.rulerPeriods || []).filter(function (period) { return period.startYear <= state.atlasYear && period.endYear >= state.atlasYear; }).sort(function (a, b) { return a.startYear - b.startYear; }).slice(-1);
          if (!rulers.length) appendText(dialog, "p", "muted", "本年无已核定君主记录。");
          rulers.forEach(function (ruler) {
            var person = findById(data.people, ruler.personId);
            if (person) {
              var link = button(ruler.name + " →", { className: "text-button", "data-ruler-person": person.id });
              link.addEventListener("click", function () { openPerson(person, data, link); }); dialog.appendChild(link);
            } else appendText(dialog, "p", "", ruler.name);
            appendText(dialog, "p", "fine-print", ruler.note);
          });
          appendText(dialog, "h3", "detail-row__label", state.atlasYear + " 年关键事件");
          var polityEvents = data.events.filter(function (event) { return (event.dynastyIds || []).indexOf(dynasty.id) !== -1 && event.startYear <= state.atlasYear && (event.endYear || event.startYear) >= state.atlasYear; });
          if (!polityEvents.length) appendText(dialog, "p", "muted", "本年无已收录关键事件。");
          polityEvents.forEach(function (event) { dialog.appendChild(eventCard(event, function (selected, source) { openEvent(selected, data, source); })); });
        }
        dialog.appendChild(labelledValue("疆域阶段说明", snapshot.note));
        if (region.note) dialog.appendChild(labelledValue("区域说明", region.note));
        if (region.accuracy) dialog.appendChild(labelledValue("疆界精度", region.accuracy === "precise" ? "资料标记为较精确边界，仍以阶段说明为准" : "近似范围示意；虚线标示非精确疆界"));
        dialog.appendChild(labelledValue("地图来源与边界", atlas.sourceNote));
      }, opener);
    }
    regions.forEach(function (region) {
      var path = svgNode("path", { d: atlas.paths[region.path], fill: region.color, class: "atlas__region" + (state.atlasPolity === region.id ? " atlas__region--selected" : ""), "data-region-id": region.id, tabindex: "0", role: "button", "aria-pressed": state.atlasPolity === region.id ? "true" : "false", "aria-label": "查看政权：" + region.name });
      path.setAttribute("fill-rule", "evenodd");
      if (region.accuracy && region.accuracy !== "precise") path.setAttribute("stroke-dasharray", "4 2");
      path.addEventListener("click", function (event) {
        if (event.detail && Date.now() < suppressMapClickUntil) return;
        openPolity(region, path);
      });
      path.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openPolity(region, path); } });
      svg.appendChild(path);
    });
    svg.appendChild(svgNode("path", { d: atlas.waterPath, class: "atlas__water", "fill-rule": "evenodd" }));
    regions.forEach(function (region) {
      svg.appendChild(svgNode("text", { x: region.label[0], y: region.label[1], class: "atlas__polity-label", "text-anchor": "middle" }, region.name));
    });
    var yearEvents = data.events.filter(function (item) { return item.startYear <= state.atlasYear && (item.endYear || item.startYear) >= state.atlasYear; });
    var eventLocations = unique([].concat.apply([], yearEvents.map(function (item) { return item.locationIds || []; })));
    var mapMarkers = [];
    eventLocations.forEach(function (id) {
      var location = findById(data.locations, id);
      if (!location || !location.mapPoint) return;
      var marker = svgNode("g", { "data-map-location": id, tabindex: "0", role: "button", "aria-label": "查看" + location.name + "当年事件" });
      marker.appendChild(svgNode("circle", { cx: location.mapPoint[0], cy: location.mapPoint[1], r: 22, class: "atlas__hit" }));
      marker.appendChild(svgNode("circle", { cx: location.mapPoint[0], cy: location.mapPoint[1], r: 7, class: "atlas__place" }));
      function openLocation() {
        var located = yearEvents.filter(function (event) { return (event.locationIds || []).indexOf(id) !== -1; });
        if (located.length === 1) openEvent(located[0], data, marker);
        else openDialog(location.name + " · " + state.atlasYear, function (dialog) {
          located.forEach(function (event) { dialog.appendChild(eventCard(event, function (selected, opener) { openEvent(selected, data, opener); })); });
        }, marker);
      }
      marker.addEventListener("click", function (event) {
        if (!event.detail) { openLocation(); return; }
        if (Date.now() < suppressMapClickUntil) return;
        var nearest = null, nearestDistance = Infinity;
        var viewport = svg.getBoundingClientRect();
        mapMarkers.forEach(function (candidate) {
          var bounds = candidate.node.querySelector(".atlas__place").getBoundingClientRect();
          if (!bounds.width || !bounds.height) return;
          var x = bounds.left + bounds.width / 2, y = bounds.top + bounds.height / 2;
          if (viewport.width && (x < viewport.left || x > viewport.right || y < viewport.top || y > viewport.bottom)) return;
          var distance = Math.hypot(event.clientX - x, event.clientY - y);
          if (distance < nearestDistance) { nearestDistance = distance; nearest = candidate; }
        });
        if (nearest) nearest.open(); else openLocation();
      });
      marker.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openLocation(); } });
      svg.appendChild(marker);
      var label = svgNode("text", { x: location.mapPoint[0] + 8, y: location.mapPoint[1] - 8, class: "atlas__label" }, location.name);
      svg.appendChild(label);
      mapMarkers.push({ node: marker, label: label, location: location, open: openLocation });
    });
    var clusters = svgNode("g", { class: "atlas__point-leaders", "pointer-events": "none" }); svg.appendChild(clusters);
    figure.appendChild(svg);
    function updateViewport() {
      var width = box[2] / state.atlasZoom;
      var height = box[3] / state.atlasZoom;
      state.atlasX = Math.max(0, Math.min(box[2] - width, state.atlasX));
      state.atlasY = Math.max(0, Math.min(box[3] - height, state.atlasY));
      svg.setAttribute("viewBox", [state.atlasX, state.atlasY, width, height].join(" "));
      Array.prototype.forEach.call(svg.querySelectorAll("text"), function (label) { label.style.fontSize = (label.classList.contains("atlas__polity-label") ? 17 : 13) / state.atlasZoom + "px"; });
      var rect = svg.getBoundingClientRect();
      var scale = rect.width && rect.height ? Math.min(rect.width / width, rect.height / height) : state.atlasZoom;
      var pointDetail = Math.min(1, Math.max(0, (state.atlasZoom - 1) / 2));
      var radius = 2.5 + pointDetail * 4.5;
      Array.prototype.forEach.call(svg.querySelectorAll(".atlas__place"), function (point) {
        point.setAttribute("r", radius / scale); point.style.strokeWidth = (0.8 + pointDetail * 1.2) / scale + "px";
      });
      Array.prototype.forEach.call(svg.querySelectorAll(".atlas__hit"), function (point) { point.setAttribute("r", 22 / scale); });
      clear(clusters);
      var positions = [];
      mapMarkers.forEach(function (marker) {
        var original = marker.location.mapPoint;
        var x = original[0] * scale, y = original[1] * scale;
        if (state.atlasZoom >= 3) {
          var attempt = 0;
          while (positions.some(function (point) { return Math.hypot(point.x - x, point.y - y) < 20; }) && attempt < 200) {
            attempt += 1;
            var angle = attempt * 2.4, offset = 5 * Math.sqrt(attempt);
            x = original[0] * scale + Math.cos(angle) * offset;
            y = original[1] * scale + Math.sin(angle) * offset;
          }
        }
        positions.push({ x: x, y: y, marker: marker });
        Array.prototype.forEach.call(marker.node.querySelectorAll("circle"), function (circle) { circle.setAttribute("cx", x / scale); circle.setAttribute("cy", y / scale); });
        if (Math.abs(x - original[0] * scale) + Math.abs(y - original[1] * scale) > 1) {
          clusters.appendChild(svgNode("line", { x1: original[0], y1: original[1], x2: x / scale, y2: y / scale, stroke: "#64706b", "stroke-width": 1 / scale, "pointer-events": "none" }));
        }
      });
      var occupied = [];
      positions.forEach(function (point) {
        var label = point.marker.label, textWidth = point.marker.location.name.length * 13;
        label.style.display = "none"; label.style.fontSize = 13 / scale + "px";
        var offsets = [[12,-12], [12,20], [-textWidth-12,-12], [-textWidth-12,20], [-textWidth/2,-22], [-textWidth/2,30]];
        for (var i = 0; i < offsets.length; i++) {
          var x = point.x + offsets[i][0], y = point.y + offsets[i][1];
          var clash = occupied.some(function (area) { return x < area.x + area.w + 4 && x + textWidth + 4 > area.x && y - 15 < area.y && y > area.y - 15; });
          clash = clash || positions.some(function (other) { return other.x + 9 > x && other.x - 9 < x + textWidth && other.y + 9 > y - 13 && other.y - 9 < y; });
          if (!clash) {
            label.style.display = ""; label.setAttribute("x", x / scale); label.setAttribute("y", y / scale);
            occupied.push({x:x,y:y,w:textWidth}); break;
          }
        }
      });
    }
    svg.setAttribute("tabindex", "0");
    function zoomAt(factor, x, y) {
      var oldZoom = state.atlasZoom;
      state.atlasZoom = Math.max(1, Math.min(16, oldZoom * factor));
      state.atlasX += x * (box[2] / oldZoom - box[2] / state.atlasZoom);
      state.atlasY += y * (box[3] / oldZoom - box[3] / state.atlasZoom);
      updateViewport();
    }
    svg.addEventListener("wheel", function (event) {
      event.preventDefault();
      var rect = svg.getBoundingClientRect();
      zoomAt(event.deltaY > 0 ? 1 / 1.15 : 1.15, (event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
    }, { passive: false });
    svg.addEventListener("keydown", function (event) {
      if (event.target !== svg) return;
      if (["+", "=", "-", "Home", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(event.key) < 0) return;
      event.preventDefault();
      if (event.key === "Home") { state.atlasZoom = 1; state.atlasX = 0; state.atlasY = 0; }
      else if (event.key === "+" || event.key === "=") zoomAt(1.5, 0.5, 0.5);
      else if (event.key === "-") zoomAt(1 / 1.5, 0.5, 0.5);
      else { state.atlasX += (event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0) * 70 / state.atlasZoom; state.atlasY += (event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0) * 70 / state.atlasZoom; }
      updateViewport();
    });
    var pointers = {};
    var gesture = null;
    var moved = false;
    function pointerList() { return Object.keys(pointers).map(function (id) { return pointers[id]; }).slice(0, 2); }
    function center(points) {
      return points.length > 1 ? { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 } : points[0];
    }
    function distance(points) {
      return points.length > 1 ? Math.sqrt(Math.pow(points[1].x - points[0].x, 2) + Math.pow(points[1].y - points[0].y, 2)) : 0;
    }
    function beginGesture() {
      var points = pointerList();
      if (!points.length) { gesture = null; return; }
      var rect = svg.getBoundingClientRect();
      var width = box[2] / state.atlasZoom;
      var height = box[3] / state.atlasZoom;
      var scale = Math.min(rect.width / width, rect.height / height);
      if (!scale) return;
      var midpoint = center(points);
      var left = rect.left + (rect.width - width * scale) / 2;
      var top = rect.top + (rect.height - height * scale) / 2;
      gesture = { center: midpoint, distance: distance(points), zoom: state.atlasZoom, scale: scale, left: left, top: top,
        anchorX: state.atlasX + (midpoint.x - left) / scale, anchorY: state.atlasY + (midpoint.y - top) / scale };
    }
    svg.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      document.dispatchEvent(new Event("mini-tool-pause"));
        if (!Object.keys(pointers).length) { moved = false; suppressMapClickUntil = 0; }
      pointers[event.pointerId] = { x: event.clientX, y: event.clientY };
      if (Object.keys(pointers).length > 1) moved = true;
      if (event.target.setPointerCapture) event.target.setPointerCapture(event.pointerId);
      beginGesture();
    });
    svg.addEventListener("pointermove", function (event) {
      if (!pointers[event.pointerId] || !gesture) return;
      pointers[event.pointerId] = { x: event.clientX, y: event.clientY };
      var points = pointerList();
      var midpoint = center(points);
      if (Math.abs(midpoint.x - gesture.center.x) + Math.abs(midpoint.y - gesture.center.y) > 5) moved = true;
      if (points.length > 1 && gesture.distance > 0) {
        state.atlasZoom = Math.max(1, Math.min(16, gesture.zoom * distance(points) / gesture.distance));
      }
      var scale = gesture.scale * state.atlasZoom / gesture.zoom;
      state.atlasX = gesture.anchorX - (midpoint.x - gesture.left) / scale;
      state.atlasY = gesture.anchorY - (midpoint.y - gesture.top) / scale;
      updateViewport();
    });
    function endPointer(event) {
      if (!pointers[event.pointerId]) return;
      delete pointers[event.pointerId];
      if (moved) suppressMapClickUntil = Date.now() + 400;
      beginGesture();
    }
    svg.addEventListener("pointerup", endPointer);
    svg.addEventListener("pointercancel", endPointer);
    svg.addEventListener("lostpointercapture", endPointer);
    updateViewport();
    figure.appendChild(element("figcaption", "atlas__caption", "双指缩放，单指拖动，点击独立地点查看事件。放大可看清密集地点；短引线连接避让后的圆点与原位置。疆域为历史概括示意，不代表精确疆界。"));
    appendText(figure, "p", "atlas__source", atlas.sourceNote);
    root.appendChild(figure);
    updateViewport();
    var section = element("section", "polity-section");
    section.appendChild(element("h3", "polity-section__title", state.atlasYear + " 年图中政权"));
    if (!regions.length) {
      section.appendChild(status("这一年暂未收录疆域阶段。"));
    } else {
      var list = element("ul", "polity-list");
      regions.forEach(function (region) {
        var item = findById(data.dynasties, region.dynastyId) || region;
        var row = element("li", "polity-item");
        row.setAttribute("data-polity-id", region.dynastyId);
        var swatch = element("span", "polity-item__swatch");
        swatch.style.backgroundColor = region.color;
        swatch.setAttribute("aria-hidden", "true");
        row.appendChild(swatch);
        var open = button(region.name, { className: "polity-item__open", "aria-label": "查看政权：" + region.name });
        open.addEventListener("click", function () { openPolity(region, open); });
        row.appendChild(open);
        if (item.startYear) row.appendChild(element("span", "polity-item__years", item.startYear + "—" + item.endYear));
        if (item.category) row.appendChild(element("span", "polity-item__category", categoryLabel(item.category)));
        list.appendChild(row);
      });
      section.appendChild(list);
    }
    root.appendChild(section);
    var events = element("section", "atlas-events");
    events.appendChild(element("h3", "polity-section__title", state.atlasYear + " 年事件"));
    yearEvents.forEach(function (item) { events.appendChild(eventCard(item, function (selected, opener) { openEvent(selected, data, opener); })); });
    if (!yearEvents.length) events.appendChild(element("p", "muted", "这一年暂无收录事件，可切换年份继续查看。"));
    root.appendChild(events);
  }

  function createApp(root, data) {
    if (!root || !data || !data.meta) return;
    if (window.__MINI_TOOL_CLEANUP__) window.__MINI_TOOL_CLEANUP__();
    var initialYear = data.meta.defaultYear || 907;
    var state = { view: "guide", year: initialYear, track: "all", timelineLimit: LIST_PAGE_SIZE, personQuery: "", personCategory: "all", peopleLimit: LIST_PAGE_SIZE, eventType: "all", eventsLimit: LIST_PAGE_SIZE, atlasYear: initialYear, atlasPolity: "", atlasZoom: 1, atlasX: 0, atlasY: 0 };
    var timer = null;
    function pause() { if (timer) clearInterval(timer); timer = null; state.playing = false; var play = root.querySelector('[data-action="play-history"]'); if (play) { play.textContent = "播放"; play.setAttribute("aria-pressed", "false"); } }
    document.addEventListener("mini-tool-pause", pause);
    function visibility() { if (document.hidden) pause(); }
    document.addEventListener("visibilitychange", visibility);
    window.__MINI_TOOL_CLEANUP__ = function () { pause(); document.removeEventListener("mini-tool-pause", pause); document.removeEventListener("visibilitychange", visibility); };
    function setState(patch, focusHeading) {
      if (patch.view && patch.view !== state.view) pause();
      if (typeof patch.year === "number") { patch.atlasYear = patch.year; patch.atlasPolity = ""; }
      else if (typeof patch.atlasYear === "number") patch.year = patch.atlasYear;
      Object.keys(patch).forEach(function (key) { state[key] = patch[key]; });
      if (state.playing && !timer) timer = setInterval(function () {
        var years = state.view === "atlas" ? atlasYears(data) : [];
        var endYear = state.view === "atlas" ? years[years.length - 1] : data.meta.maxYear;
        if (!document.body.contains(root) || document.hidden || state.atlasYear >= endYear) { pause(); return; }
        setState({ year: state.view === "atlas" ? years[years.indexOf(state.atlasYear) + 1] : state.atlasYear + 1 });
      }, 1600);
      if (!state.playing && timer) pause();
      var active = document.activeElement;
      var field = active && active.getAttribute("data-year-slider") !== null ? "[data-year-slider]" : active && active.getAttribute("data-year-step") ? '[data-year-step="' + active.getAttribute("data-year-step") + '"]' : null;
      ["data-track", "data-rail-year"].forEach(function (attribute) {
        if (active && active.hasAttribute(attribute)) field = '[' + attribute + '="' + active.getAttribute(attribute) + '"]';
      });
      render();
      if (field && root.querySelector(field)) root.querySelector(field).focus();
      if (focusHeading) {
        var title = root.querySelector("h2");
        if (title) title.focus();
      }
    }
    function render() {
      document.body.setAttribute("data-view", state.view);
      renderTabs(state, setState);
      clear(root);
      if (state.view === "timeline") renderTimeline(root, data, state, setState);
      else if (state.view === "people") renderPeople(root, data, state, setState);
      else if (state.view === "events") renderEvents(root, data, state, setState);
      else if (state.view === "atlas") renderAtlas(root, data, state, setState);
      else renderGuide(root, data, setState);
    }
    render();
  }

  window.__MINI_TOOL_APP__ = { createApp: createApp };
  if (window.__MINI_TOOL_DATA__) {
    createApp(document.getElementById("main"), window.__MINI_TOOL_DATA__);
  } else {
    var initialRoot = document.getElementById("main");
    if (initialRoot) initialRoot.appendChild(status("内容正在准备中，请稍后再试。"));
  }
}());
