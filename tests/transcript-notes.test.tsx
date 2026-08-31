import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TranscriptNotes } from "@/features/notes/transcript-notes";
import {
  transcriptEpisodes,
  transcriptSources,
  validateTranscriptNotes,
} from "@/data/notes";

describe("transcript notes data", () => {
  it("publishes one reviewed note for each of the six episodes", () => {
    expect(transcriptEpisodes).toHaveLength(6);
    expect(transcriptEpisodes.map((episode) => episode.episode)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });

  it("keeps every finding and knowledge point traceable", () => {
    expect(validateTranscriptNotes(transcriptEpisodes, transcriptSources)).toEqual(
      [],
    );
  });
});

describe("TranscriptNotes", () => {
  it("renders the audit boundary, all episodes, and source ledger", () => {
    render(
      <TranscriptNotes
        episodes={transcriptEpisodes}
        sources={transcriptSources}
      />,
    );

    expect(
      screen.getByText("逐字稿不是史料原文，也不是已经核定的史实"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(7);
    expect(screen.getByRole("heading", { name: /黄巢起义/ })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /大宋统一/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "来源账本" })).toBeInTheDocument();
    expect(screen.getAllByText("需语境").length).toBeGreaterThan(0);
    expect(screen.getAllByText("逐字稿错讹").length).toBeGreaterThan(0);
  });
});
