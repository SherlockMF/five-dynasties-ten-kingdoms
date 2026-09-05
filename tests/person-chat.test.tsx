import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { people } from "@/data/seed";
import { PersonChat } from "@/features/people/person-chat";

const shi = people.find((person) => person.id === "shi-jingtang")!;
const li = people.find((person) => person.id === "li-yu")!;
const reply = (answer = "若以我的处境推想，需要权衡眼前与长远。") => Response.json({ answer, references: ["测试史料"] });

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
});

describe("PersonChat", () => {
  it("opens a conversation dialog from a bubble and returns focus on close", async () => {
    const user = userEvent.setup();
    render(<PersonChat person={shi} />);
    await user.click(screen.getByRole("button", { name: "与石敬瑭对话" }));
    expect(screen.getByRole("dialog", { name: "与石敬瑭对话" })).toBeVisible();
    expect(screen.getByText("依据史料的角色演绎，并非本人发言或史料原文。")).toBeVisible();
    expect(screen.getByRole("button", { name: "介绍一下你的生平" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "随意聊" }));
    expect(screen.getByText(/需要接入大模型/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "关闭对话" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "与石敬瑭对话" })).toHaveFocus();
  });

  it("shows a friendly error when the server returns HTML", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>Bad Gateway</html>", { status: 502 })));
    render(<PersonChat person={shi} />);
    await user.click(screen.getByRole("button", { name: "与石敬瑭对话" }));
    await user.type(screen.getByRole("textbox", { name: "对石敬瑭说" }), "说说你的经历");
    await user.click(screen.getByRole("button", { name: "发送对话" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("对话暂时不可用，请稍后重试。");
    expect(screen.getByRole("alert")).not.toHaveTextContent("Unexpected");
  });
  it("restores page scrolling on Escape and keeps the draft when reopened", async () => {
    const user = userEvent.setup();
    render(<PersonChat person={shi} />);
    await user.click(screen.getByRole("button", { name: "与石敬瑭对话" }));
    await user.type(screen.getByRole("textbox", { name: "对石敬瑭说" }), "还没问完");
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { bubbles: false, cancelable: true }));
    expect(document.body.style.overflow).toBe("");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "与石敬瑭对话" }));
    expect(screen.getByRole("textbox", { name: "对石敬瑭说" })).toHaveValue("还没问完");
  });

  it("sends follow-up turns and changes conversation mode", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockImplementation(async () => reply());
    vi.stubGlobal("fetch", fetchMock);
    render(<PersonChat person={shi} />);
    await user.click(screen.getByRole("button", { name: "与石敬瑭对话" }));
    const input = screen.getByRole("textbox", { name: "对石敬瑭说" });
    await user.type(input, "你怎么看当年的选择？");
    await user.click(screen.getByRole("button", { name: "发送对话" }));
    expect(await screen.findByText("若以我的处境推想，需要权衡眼前与长远。")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "随意聊" }));
    await user.type(input, "那我遇到类似困难呢？");
    await user.click(screen.getByRole("button", { name: "发送对话" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      personId: shi.id, mode: "free", message: "那我遇到类似困难呢？",
      history: [
        { role: "user", content: "你怎么看当年的选择？" },
        { role: "assistant", content: "若以我的处境推想，需要权衡眼前与长远。" },
      ],
    });
  });

  it("preserves failed input and retries without duplicating a user turn", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ code: "CHAT_UNAVAILABLE" }, { status: 503 })).mockResolvedValueOnce(reply("重试后的回应"));
    vi.stubGlobal("fetch", fetchMock);
    render(<PersonChat person={shi} />);
    await user.click(screen.getByRole("button", { name: "与石敬瑭对话" }));
    const input = screen.getByRole("textbox", { name: "对石敬瑭说" });
    await user.type(input, "聊聊选择");
    await user.click(screen.getByRole("button", { name: "发送对话" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("对话暂时不可用");
    expect(input).toHaveValue("聊聊选择");
    await user.click(screen.getByRole("button", { name: "重试" }));
    expect(await screen.findByText("重试后的回应")).toBeVisible();
    expect(screen.getAllByText("聊聊选择")).toHaveLength(1);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).history).toEqual([]);
  });

  it("cancels the previous person's request and ignores a late reply", async () => {
    const user = userEvent.setup();
    let resolve!: (response: Response) => void;
    const fetchMock = vi.fn().mockImplementation(() => new Promise<Response>((done) => { resolve = done; }));
    vi.stubGlobal("fetch", fetchMock);
    const { rerender } = render(<PersonChat person={shi} />);
    await user.click(screen.getByRole("button", { name: "与石敬瑭对话" }));
    await user.type(screen.getByRole("textbox", { name: "对石敬瑭说" }), "我的旧问题");
    await user.click(screen.getByRole("button", { name: "发送对话" }));
    rerender(<PersonChat person={li} />);
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    await act(async () => resolve(reply("旧人物的回应")));
    await user.click(screen.getByRole("button", { name: "与李煜对话" }));
    expect(screen.queryByText("旧人物的回应")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "对李煜说" })).toHaveValue("");
  });

  it("copies the selected persona without requiring a model", async () => {
    const user = userEvent.setup();
    const clipboard = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<PersonChat person={li} />);
    await user.click(screen.getByRole("button", { name: "与李煜对话" }));
    expect(screen.queryByText("人物设定")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "随意聊" }));
    await user.click(screen.getByText("人物设定"));
    await user.click(screen.getByRole("button", { name: "复制人物设定" }));
    expect(clipboard).toHaveBeenCalledWith(expect.stringContaining("李煜"));
    expect(clipboard).toHaveBeenCalledWith(expect.stringContaining("角色演绎"));
    expect(await screen.findByText("已复制人物设定")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "问历史" }));
    expect(screen.queryByText("人物设定")).not.toBeInTheDocument();
  });

  it.each([
    [{ method: "local" }, "站内资料 · 本地整理"],
    [{ method: "model" }, "结合史料生成"],
    [{ method: "local", fallbackReason: "model-unavailable" }, "模型暂时不可用，本次由本地资料回答。"],
  ])("identifies the answering method without losing source references", async (metadata, label) => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ answer: "这是根据史料作出的回答。", references: ["测试史料"], ...metadata })));
    render(<PersonChat person={shi} />);
    await user.click(screen.getByRole("button", { name: "与石敬瑭对话" }));
    await user.type(screen.getByRole("textbox", { name: "对石敬瑭说" }), "聊聊燕云");
    await user.click(screen.getByRole("button", { name: "发送对话" }));
    expect(await screen.findByText(label)).toBeVisible();
    expect(screen.getByText("测试史料")).toBeInTheDocument();
  });

  it("does not submit while composing Chinese or using Shift+Enter", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockImplementation(async () => reply());
    vi.stubGlobal("fetch", fetchMock);
    render(<PersonChat person={shi} />);
    await user.click(screen.getByRole("button", { name: "与石敬瑭对话" }));
    const input = screen.getByRole("textbox", { name: "对石敬瑭说" });
    await user.type(input, "问题");
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });

  it("clears conversation and cancels pending work on restart", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockImplementation(() => new Promise(() => {}));
    vi.stubGlobal("fetch", fetchMock);
    render(<PersonChat person={shi} />);
    await user.click(screen.getByRole("button", { name: "与石敬瑭对话" }));
    await user.type(screen.getByRole("textbox", { name: "对石敬瑭说" }), "旧问题");
    await user.click(screen.getByRole("button", { name: "发送对话" }));
    await user.click(screen.getByRole("button", { name: "重新开始对话" }));
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    expect(screen.getByRole("textbox", { name: "对石敬瑭说" })).toHaveValue("");
    expect(screen.queryByText("正在回应……")).not.toBeInTheDocument();
  });
});
