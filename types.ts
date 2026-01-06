export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface ProductAnalysisResult {
  rawText: string;
  sources: GroundingChunk[];
}

export enum AnalysisSection {
  Overview = 'overview',
  Price = 'price',
  Pros = 'pros',
  Cons = 'cons',
  Verdict = 'verdict'
}

export interface ChartDataPoint {
  date: string;
  price: number;
}
