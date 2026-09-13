import { renderSeriesPage, type SeriesPageProps } from "@/features/series/series-page";
export default async function SeriesTimeline(props: SeriesPageProps) { return renderSeriesPage(props, "timeline"); }
