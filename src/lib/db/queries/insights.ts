import "server-only";
import { getAnalyticsSummary, type AnalyticsFilter } from "./analytics";
import type { ResearchInsight } from "@/types/participant";

/**
 * Derive narrative findings from measured statistics.
 *
 * Every insight is gated on the underlying figure actually existing. The prior
 * implementation compared `Math.abs(mean - median) >= 10` against values that
 * had been defaulted to zero for empty datasets, so a cohort with no data could
 * report "Median reaction time (0 ms) is 400 ms faster than mean". Each
 * condition below returns early when its input is null, so a finding can only
 * be stated about a measurement that exists.
 */
export async function getResearchInsights(filter: AnalyticsFilter = {}): Promise<ResearchInsight[]> {
  const summary = await getAnalyticsSummary(filter);
  const insights: ResearchInsight[] = [];

  const { averageReactionTimeMs: mean, medianReactionTimeMs: median } = summary;

  // 1. Distribution asymmetry: mean and median diverging signals a skewed tail.
  if (mean !== null && median !== null) {
    const diff = mean - median;
    if (Math.abs(diff) >= 10) {
      insights.push({
        id: "insight-skew",
        category: "latency",
        title: "Latency Distribution Asymmetry",
        message: `Median reaction time (${median} ms) is ${Math.abs(diff)} ms ${
          diff > 0 ? "faster than" : "slower than"
        } mean (${mean} ms), indicating ${diff > 0 ? "positive right-tail skew from cognitive conflict" : "left-tail skew"}.`,
        type: "neutral",
        metricImpact: `${diff > 0 ? "-" : "+"}${Math.abs(diff)} ms delta`,
      });
    }
  }

  // 2. Chromatic interference cost: colour trials versus pure text reading.
  const textStim = summary.stimulusBreakdown.find((s) => s.type === "text");
  const colorStim = summary.stimulusBreakdown.find((s) => s.type === "color");
  if (textStim?.avgRt != null && colorStim?.avgRt != null) {
    const gap = colorStim.avgRt - textStim.avgRt;
    insights.push({
      id: "insight-stimulus-cost",
      category: "stimulus",
      title: "Chromatic Interference Cost",
      message: `Color discrimination trials produce a ${gap >= 0 ? "+" : ""}${gap} ms processing latency overhead relative to pure text reading trials, confirming classic chromatic attention cost.`,
      type: gap > 40 ? "warning" : "positive",
      metricImpact: `${gap >= 0 ? "+" : ""}${gap} ms interference`,
    });
  }

  // 3. Practice effect: earliest versus latest observed trial, compared only
  //    when the cohort actually reached both ends of the block.
  const progression = summary.trialProgression;
  if (progression.length >= 2) {
    const first = progression[0];
    const last = progression[progression.length - 1];
    if (first.avgRt !== null && last.avgRt !== null) {
      const speedup = Math.round(first.avgRt - last.avgRt);
      if (speedup > 15) {
        insights.push({
          id: "insight-learning",
          category: "learning",
          title: "Intra-Session Practice Acceleration",
          message: `Participants exhibited a ${speedup} ms latency acceleration by trial ${last.trial} compared to baseline trial ${first.trial}.`,
          type: "positive",
          metricImpact: `-${speedup} ms speedup`,
        });
      }
    }
  }

  // 4. Sustained accuracy ceiling.
  if (summary.accuracyPercent !== null && summary.accuracyPercent >= 90) {
    insights.push({
      id: "insight-accuracy-ceiling",
      category: "accuracy",
      title: "High Performance Threshold",
      message: `Cohort accuracy remains sustained at ${summary.accuracyPercent}%, meeting rigorous psychometric benchmark criteria.`,
      type: "positive",
      metricImpact: `${summary.accuracyPercent}% fidelity`,
    });
  }

  return insights;
}
