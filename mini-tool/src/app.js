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
    var backdrop = element("div", "dialog-backdrop");
    var dialog = element("section", "dialog");
    var top = element("div", "dialog__top");
    var titleNode = element("h2", "dialog__title", title);
    var closeButton = button("关闭", { className: "dialog__close", "data-action": "close-dialog", "aria-label": "关闭详情" });
    var closed = false;
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "dialog-title");
    titleNode.id = "dialog-title";
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
      if (opener && document.body.contains(opener)) opener.focus();
    }
    function onKeydown(event) {
      if (event.key === "Escape" || event.keyCode === 27) closeDialog();
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
    root.appendChild(heading("从一条线，读懂百年山河", "离线历史导览"));
    root.appendChild(element("p", "lede", "从唐末余波到北汉覆亡，沿纪年、人物与事件三条路径，梳理五代十国的关键转折。"));
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
    range.appendChild(element("p", "range-panel__years", data.meta.minYear + "—" + data.meta.maxYear));
    range.appendChild(element("p", "muted", "聚焦晚唐崩解、五代更替、十国并立与北宋统一进程。"));
    root.appendChild(range);
    var notes = element("section", "notice-panel");
    notes.appendChild(element("h3", "notice-panel__title", "阅读说明"));
    notes.appendChild(element("p", "", "内容来源：以传统正史、编年史及公开研究资料为线索整理，详情中的来源标签用于继续查考。"));
    notes.appendChild(element("p", "", "AI 边界：本工具不使用生成式 AI，不进行在线问答；检索仅在包内历史资料中完成。"));
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

  function openEvent(item, data, opener) {
    openDialog(item.title, function (dialog) {
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
    }, opener);
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

  function renderTimeline(root, data, state, setState) {
    root.appendChild(heading("把百年放在同一条线上", "纪年"));
    root.appendChild(element("p", "lede", "选择年份与线索，查看当年的关键转折。"));
    var controls = element("div", "filter-panel");
    var years = [{ value: "all", label: "全部年份" }];
    var year;
    for (year = data.meta.minYear; year <= data.meta.maxYear; year += 1) years.push({ value: year, label: year + " 年" });
    var tracks = unique([].concat.apply([], data.events.map(function (item) { return item.tracks || []; })));
    controls.appendChild(createSelect("年份", "year", years, state.year, function (event) { setState({ year: event.target.value === "all" ? "all" : Number(event.target.value) }); }));
    controls.appendChild(createSelect("线索", "track", [{ value: "all", label: "全部线索" }].concat(tracks.map(function (track) { return { value: track, label: trackLabel(track) }; })), state.track, function (event) { setState({ track: event.target.value }); }));
    root.appendChild(controls);
    var matches = data.events.filter(function (item) {
      var yearMatches = state.year === "all" || item.startYear === state.year || (item.endYear && item.startYear <= state.year && item.endYear >= state.year);
      var trackMatches = state.track === "all" || (item.tracks || []).indexOf(state.track) !== -1;
      return yearMatches && trackMatches;
    });
    if (!matches.length) {
      root.appendChild(status("这一年没有找到符合当前线索的事件。", "查看全部事件", "show-all-events", function () { setState({ year: "all", track: "all" }); }));
      return;
    }
    var list = element("div", "card-list");
    matches.forEach(function (item) {
      list.appendChild(eventCard(item, function (selected, opener) { openEvent(selected, data, opener); }));
    });
    root.appendChild(list);
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

  function renderPeople(root, data, state, setState) {
    root.appendChild(heading("在人的选择里看见时代", "人物"));
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
    root.appendChild(renderChips(["all"].concat(categories), state.personCategory, "data-category", function (value) { setState({ personCategory: value, peopleLimit: LIST_PAGE_SIZE }); }, categoryLabel));
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
    var list = element("div", "card-list card-list--people");
    matches.slice(0, state.peopleLimit).forEach(function (item) {
      var card = element("article", "history-card person-card");
      appendText(card, "p", "history-card__meta", (item.roles || []).join(" · "));
      card.appendChild(element("h3", "history-card__title", item.name));
      appendText(card, "p", "history-card__summary", item.summary);
      var open = button("阅读小传", { className: "text-button", "data-person-id": item.id, "aria-label": "阅读" + item.name + "小传" });
      open.addEventListener("click", function () {
        openDialog(item.name, function (dialog) {
          appendText(dialog, "p", "dialog__meta", (item.roles || []).join(" · "));
          dialog.appendChild(labelledValue("人物小传", item.biography || item.summary));
          if (item.aliases && item.aliases.length) dialog.appendChild(labelledValue("别名", item.aliases.join("、")));
          dialog.appendChild(labelledValue("所属政权", relatedNames(item.dynastyIds, data.dynasties)));
          dialog.appendChild(labelledValue("关联关键事件", relatedNames(data.events.filter(function (event) {
            return (event.personIds || []).indexOf(item.id) !== -1;
          }).map(function (event) { return event.id; }), data.events)));
        }, open);
      });
      card.appendChild(open);
      list.appendChild(card);
    });
    root.appendChild(list);
    if (matches.length > state.peopleLimit) {
      var morePeople = button("加载更多", { className: "button button--primary", "data-action": "load-more-people" });
      morePeople.addEventListener("click", function () { setState({ peopleLimit: state.peopleLimit + LIST_PAGE_SIZE }); });
      root.appendChild(morePeople);
    }
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
    root.appendChild(element("p", "lede", "地点按经纬度作相对定位，政权仅展示存续关系。"));
    var years = [];
    var year;
    for (year = data.meta.minYear; year <= data.meta.maxYear; year += 1) years.push({ value: year, label: year + " 年" });
    var controls = element("div", "filter-panel filter-panel--single");
    controls.appendChild(createSelect("查看年份", "atlas-year", years, state.atlasYear, function (event) { setState({ atlasYear: Number(event.target.value) }); }));
    root.appendChild(controls);
    var active = data.dynasties.filter(function (item) { return item.startYear <= state.atlasYear && item.endYear >= state.atlasYear; });
    var figure = element("figure", "atlas");
    var svg = svgNode("svg", { viewBox: "0 0 620 420", role: "img", "aria-label": state.atlasYear + "年政权与重要地点示意图", preserveAspectRatio: "xMidYMid meet" });
    svg.appendChild(svgNode("path", { d: "M132 48 C225 17 349 35 438 82 C524 128 529 223 472 304 C420 377 282 373 177 329 C82 289 53 192 88 111 C98 87 112 67 132 48 Z", class: "atlas__land" }));
    data.locations.forEach(function (location) {
      var x = 70 + ((location.longitude - 73) / 62) * 480;
      var y = 328 - ((location.latitude - 18) / 36) * 255;
      if (x < 72) x = 72;
      if (x > 548) x = 548;
      if (y < 70) y = 70;
      if (y > 330) y = 330;
      svg.appendChild(svgNode("circle", { cx: String(x), cy: String(y), r: "5", class: "atlas__place" }));
      svg.appendChild(svgNode("text", { x: String(x + 9), y: String(y + 4), class: "atlas__label" }, location.name));
    });
    active.forEach(function (dynasty, index) {
      var x = 105 + (index % 5) * 103;
      var y = 350 + Math.floor(index / 5) * 22;
      svg.appendChild(svgNode("circle", { cx: String(x - 10), cy: String(y - 4), r: "4", fill: dynasty.color || "#477b72" }));
      svg.appendChild(svgNode("text", { x: String(x), y: String(y), class: "atlas__polity-label" }, dynasty.name));
    });
    figure.appendChild(svg);
    figure.appendChild(element("figcaption", "atlas__caption", "山河图为阅读辅助示意，不代表精确疆界；地点位置来自包内经纬度资料。"));
    root.appendChild(figure);
    var section = element("section", "polity-section");
    section.appendChild(element("h3", "polity-section__title", state.atlasYear + " 年存续政权"));
    if (!active.length) {
      section.appendChild(status("这一年暂未收录存续政权。"));
    } else {
      var list = element("ul", "polity-list");
      active.forEach(function (item) {
        var row = element("li", "polity-item");
        row.setAttribute("data-polity-id", item.id);
        var swatch = element("span", "polity-item__swatch");
        swatch.style.backgroundColor = item.color || "#477b72";
        swatch.setAttribute("aria-hidden", "true");
        row.appendChild(swatch);
        row.appendChild(element("strong", "polity-item__name", item.name));
        row.appendChild(element("span", "polity-item__years", item.startYear + "—" + item.endYear));
        row.appendChild(element("span", "polity-item__category", categoryLabel(item.category)));
        list.appendChild(row);
      });
      section.appendChild(list);
    }
    root.appendChild(section);
  }

  function createApp(root, data) {
    if (!root || !data || !data.meta) return;
    var state = { view: "guide", year: 907, track: "all", personQuery: "", personCategory: "all", peopleLimit: LIST_PAGE_SIZE, eventType: "all", eventsLimit: LIST_PAGE_SIZE, atlasYear: 907 };
    function setState(patch, focusHeading) {
      Object.keys(patch).forEach(function (key) { state[key] = patch[key]; });
      render();
      if (focusHeading) {
        var title = root.querySelector("h2");
        if (title) title.focus();
      }
    }
    function render() {
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
