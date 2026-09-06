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
    controls.appendChild(createSelect("年份", "year", years, state.year, function (event) { setState({ year: event.target.value === "all" ? "all" : Number(event.target.value), timelineLimit: LIST_PAGE_SIZE }); }));
    controls.appendChild(createSelect("线索", "track", [{ value: "all", label: "全部线索" }].concat(tracks.map(function (track) { return { value: track, label: trackLabel(track) }; })), state.track, function (event) { setState({ track: event.target.value, timelineLimit: LIST_PAGE_SIZE }); }));
    root.appendChild(controls);
    var matches = data.events.filter(function (item) {
      var yearMatches = state.year === "all" || item.startYear === state.year || (item.endYear && item.startYear <= state.year && item.endYear >= state.year);
      var trackMatches = state.track === "all" || (item.tracks || []).indexOf(state.track) !== -1;
      return yearMatches && trackMatches;
    });
    if (!matches.length) {
      root.appendChild(status("这一年没有找到符合当前线索的事件。", "查看全部事件", "show-all-events", function () { setState({ year: "all", track: "all", timelineLimit: LIST_PAGE_SIZE }); }));
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
    var navigation = element("div", "person-actions");
    var content = element("div", "person-content");
    var messages = [];
    var selectedEvent = null;
    var ownEvents = data.events.filter(function (event) { return (event.personIds || []).indexOf(item.id) !== -1; });
    function renderLog(log) {
      clear(log);
      messages.forEach(function (message) {
        var turn = element("div", "demo-turn");
        appendText(turn, "p", "demo-question", "你：" + message.question);
        appendText(turn, "p", "eyebrow", message.kind);
        appendText(turn, "p", "demo-answer", message.answer);
        appendText(turn, "p", "fine-print", message.sources);
        log.appendChild(turn);
      });
      log.scrollTop = log.scrollHeight;
    }
    function show(panel) {
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
      appendText(content, "p", "eyebrow", "预设剧情演示，非实时 AI");
      appendText(content, "p", "fine-print", "点击问题探索，暂不支持自由输入。角色演绎不是历史原话；其余回答为资料说明。仅保留最近 12 轮。");
      var log = element("div", "demo-log");
      log.setAttribute("role", "log");
      log.setAttribute("aria-label", item.name + "演示对话");
      log.setAttribute("aria-live", "polite");
      renderLog(log);
      content.appendChild(log);
      var questions = element("div", "person-actions");
      var followups = element("div", "person-actions");
      function reply(question, answer, sources, adapted) {
        messages.push({ question: question, answer: answer, sources: (sources || []).join("；"), kind: adapted ? "角色演绎，非历史原话" : "资料说明" });
        if (messages.length > 12) messages.shift();
        renderLog(log);
      }
      function eventReply(event, field, label) {
        var adapted = data.personDialogues && data.personDialogues[item.id] && data.personDialogues[item.id][event.id];
        var text = adapted && adapted[field];
        reply(event.title + " · " + label, (text || event[field]) + (event.disputedNote ? "\n史料异说：" + event.disputedNote : ""), event.sourceRefs, Boolean(text));
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
          reply(entry[1], entry[0] === "life" ? (item.biography || item.summary) + (item.disputedNote ? "\n史料异说：" + item.disputedNote : "") : "这是预设演示，不是真实人物发言。资料说明来自已收录记录，角色对白为文学化改编，不能当作史料引文。未收录的问题不作推断。", item.sourceRefs, false);
        });
        questions.appendChild(question);
      });
      content.appendChild(questions);
      if (ownEvents.length) {
        content.appendChild(createSelect("选择想聊的事件", "demo-event", [{ value: "", label: "请选择事件" }].concat(ownEvents.map(function (event) { return { value: event.id, label: event.startYear + " · " + event.title }; })), selectedEvent ? selectedEvent.id : "", function (event) {
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
      } else appendText(content, "p", "fine-print", "此人物暂无收录的关联事件。");
      renderFollowups();
      content.appendChild(followups);
      var reset = button("清空演示", { className: "text-button", "data-action": "clear-demo" });
      reset.addEventListener("click", function () {
        messages = []; selectedEvent = null;
        var selector = content.querySelector('[data-field="demo-event"]');
        if (selector) selector.value = "";
        renderLog(log); renderFollowups();
      });
      content.appendChild(reset);
    }
    [["profile", "人物小传"], ["demo", "对话演示"], ["prompt", "查看人物提示词"]].forEach(function (entry) {
      var control = button(entry[1], { className: "chip", "data-person-panel": entry[0] });
      control.addEventListener("click", function () { show(entry[0]); });
      navigation.appendChild(control);
    });
    dialog.appendChild(navigation);
    dialog.appendChild(content);
    show("profile");
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
      var portrait = portraitFigure(item, false);
      if (portrait) card.appendChild(portrait);
      var body = element("div", "person-card__body");
      appendText(body, "p", "history-card__meta", (item.roles || []).join(" · "));
      body.appendChild(element("h3", "history-card__title", item.name));
      appendText(body, "p", "history-card__summary", item.summary);
      var open = button("阅读小传", { className: "text-button", "data-person-id": item.id, "aria-label": "阅读" + item.name + "小传" });
      open.addEventListener("click", function () {
        openDialog(item.name, function (dialog) {
          personExperience(dialog, item, data, function (dialog) {
          appendText(dialog, "p", "dialog__meta", (item.roles || []).join(" · "));
          var detailPortrait = portraitFigure(item, true);
          if (detailPortrait) dialog.appendChild(detailPortrait);
          dialog.appendChild(labelledValue("人物小传", item.biography || item.summary));
          if (item.aliases && item.aliases.length) dialog.appendChild(labelledValue("别名", item.aliases.join("、")));
          dialog.appendChild(labelledValue("所属政权", relatedNames(item.dynastyIds, data.dynasties)));
          dialog.appendChild(labelledValue("关联关键事件", relatedNames(data.events.filter(function (event) {
            return (event.personIds || []).indexOf(item.id) !== -1;
          }).map(function (event) { return event.id; }), data.events)));
          });
        }, open);
      });
      body.appendChild(open);
      card.appendChild(body);
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
    root.appendChild(element("p", "lede", "循着年份看政权疆域与当年事件，点击色块了解政权。"));
    var atlas = data.atlas;
    if (!atlas || !atlas.years || !atlas.snapshots || !atlas.paths) {
      root.appendChild(status("历史地图资料未载入，暂时无法展示疆域。"));
      return;
    }
    var years = [];
    var year;
    for (year = data.meta.minYear; year <= data.meta.maxYear; year += 1) years.push({ value: year, label: year + " 年" });
    var controls = element("div", "filter-panel filter-panel--single");
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
    eventLocations.forEach(function (id) {
      var location = findById(data.locations, id);
      if (!location || !location.mapPoint) return;
      svg.appendChild(svgNode("circle", { cx: location.mapPoint[0], cy: location.mapPoint[1], r: "5", class: "atlas__place", "data-map-location": id }));
      svg.appendChild(svgNode("text", { x: location.mapPoint[0] + 8, y: location.mapPoint[1] - 8, class: "atlas__label" }, location.name));
    });
    figure.appendChild(svg);
    var tools = element("div", "atlas__tools");
    tools.setAttribute("aria-label", "地图视野控制");
    function updateViewport() {
      var width = box[2] / state.atlasZoom;
      var height = box[3] / state.atlasZoom;
      state.atlasX = Math.max(0, Math.min(box[2] - width, state.atlasX));
      state.atlasY = Math.max(0, Math.min(box[3] - height, state.atlasY));
      svg.setAttribute("viewBox", [state.atlasX, state.atlasY, width, height].join(" "));
    }
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
        state.atlasZoom = Math.max(1, Math.min(4, gesture.zoom * distance(points) / gesture.distance));
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
    [{ label: "+", name: "zoom-in", title: "放大地图", zoom: 1.5 }, { label: "−", name: "zoom-out", title: "缩小地图", zoom: 1 / 1.5 }, { label: "↑", name: "pan-up", title: "向北移动", dy: -1 }, { label: "↓", name: "pan-down", title: "向南移动", dy: 1 }, { label: "←", name: "pan-left", title: "向西移动", dx: -1 }, { label: "→", name: "pan-right", title: "向东移动", dx: 1 }, { label: "全图", name: "reset-map", title: "恢复完整地图" }].forEach(function (tool) {
      var control = button(tool.label, { className: "atlas__tool", "data-action": tool.name, "aria-label": tool.title });
      control.addEventListener("click", function () {
        if (tool.zoom) {
          var oldWidth = box[2] / state.atlasZoom;
          var oldHeight = box[3] / state.atlasZoom;
          state.atlasZoom = Math.max(1, Math.min(4, state.atlasZoom * tool.zoom));
          state.atlasX += (oldWidth - box[2] / state.atlasZoom) / 2;
          state.atlasY += (oldHeight - box[3] / state.atlasZoom) / 2;
        } else if (tool.dx || tool.dy) {
          state.atlasX += (tool.dx || 0) * box[2] / state.atlasZoom / 5;
          state.atlasY += (tool.dy || 0) * box[3] / state.atlasZoom / 5;
        } else { state.atlasZoom = 1; state.atlasX = 0; state.atlasY = 0; }
        updateViewport();
      });
      tools.appendChild(control);
    });
    updateViewport();
    figure.appendChild(tools);
    figure.appendChild(element("figcaption", "atlas__caption", "双指缩放，单指拖动，轻点政权查看详情。红点为当年事件地点；疆域为历史概括示意，不代表精确疆界。"));
    appendText(figure, "p", "atlas__source", atlas.sourceNote);
    root.appendChild(figure);
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
    var state = { view: "guide", year: 907, track: "all", timelineLimit: LIST_PAGE_SIZE, personQuery: "", personCategory: "all", peopleLimit: LIST_PAGE_SIZE, eventType: "all", eventsLimit: LIST_PAGE_SIZE, atlasYear: 907, atlasPolity: "", atlasZoom: 1, atlasX: 0, atlasY: 0 };
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
