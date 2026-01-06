import { GoogleGenAI } from "@google/genai";
import { ProductAnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchProduct = async (query: string, imageBase64?: string): Promise<ProductAnalysisResult> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    // Construct the prompt parts
    const parts: any[] = [];

    // If an image is provided, add it to the parts
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg', // Assuming JPEG for simplicity from canvas/input, serves most cases
          data: imageBase64
        }
      });
      parts.push({
        text: "請辨識這張圖片中的產品，並針對該產品進行分析。"
      });
    }

    const textPrompt = `
      你是一位專業的台灣購物助手。使用者正在搜尋： "${query}" ${imageBase64 ? '(請結合圖片辨識結果)' : ''}。
      
      請執行 Google Search 來尋找該產品的最新資訊、價格與評價。
      
      **重要評價搜尋策略：**
      請特別針對 **PTT (批踢踢實業坊)**、**Dcard**、**Mobile01**、**Threads** 以及國外知名論壇 (如 Reddit) 搜尋真實的使用者心得與評價。不要只看官方宣傳。
      
      請嚴格按照以下 Markdown 標題格式回傳 (使用繁體中文)：
      
      # 產品概覽
      (簡短介紹產品是什麼，如果是圖片搜尋請先說明辨識出的型號)。
      
      # 價格分析
      (說明目前的市場價格範圍、是否有特價，幣別請主要使用 TWD)。
      
      # 優點
      (條列出使用者在論壇上提到的主要優點)。
      
      # 缺點
      (條列出使用者在論壇上提到的抱怨或災情)。
      
      # 專家點評
      (綜合 PTT/Threads 鄉民意見與客觀規格，給出最終購買建議)。

      語氣請保持客觀、專業但親切，使用台灣習慣的用語。
    `;

    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model,
      contents: { parts: parts },
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "無法產生詳細分析報告。";
    
    // Extract grounding chunks for sources
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      rawText: text,
      sources: sources
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("無法獲取產品數據，請稍後再試。");
  }
};