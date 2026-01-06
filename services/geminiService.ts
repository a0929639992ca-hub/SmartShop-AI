import { GoogleGenAI } from "@google/genai";
import { ProductAnalysisResult } from '../types';

// 定義模型嘗試順序：優先使用 V3，若失敗 (如配額滿) 則嘗試 V2
const MODELS_TO_TRY = ['gemini-3-flash-preview', 'gemini-2.0-flash-exp'];

export const searchProduct = async (query: string, imageBase64?: string): Promise<ProductAnalysisResult> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key 尚未設定。請確認環境變數 API_KEY (或 VITE_API_KEY) 是否正確。");
  }
  
  const ai = new GoogleGenAI({ apiKey: apiKey });

  // 建構 Prompt (共用)
  const parts: any[] = [];

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
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

  let lastError: any = null;

  // 嘗試迴圈：如果第一個模型失敗，嘗試下一個
  for (const model of MODELS_TO_TRY) {
    try {
      console.log(`正在嘗試使用模型搜尋: ${model}`);

      const response = await ai.models.generateContent({
        model,
        contents: { parts: parts },
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "無法產生詳細分析報告。";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      // 成功取得資料，直接回傳
      return {
        rawText: text,
        sources: sources
      };

    } catch (error: any) {
      console.warn(`模型 ${model} 請求失敗:`, error);
      lastError = error;
      // 繼續迴圈嘗試下一個模型
    }
  }

  // 如果所有模型都失敗，處理最後一個錯誤
  let errorMessage = "無法獲取產品數據";
    
  if (lastError) {
      if (lastError instanceof Error) {
          errorMessage = lastError.message;
          // 嘗試解析 JSON 格式的錯誤訊息
          try {
              const match = errorMessage.match(/\{.*\}/);
              if (match) {
                  const errorObj = JSON.parse(match[0]);
                  if (errorObj.error?.message) {
                      errorMessage = errorObj.error.message;
                  }
              }
          } catch (e) { /* ignore */ }
      } else if (typeof lastError === 'string') {
          errorMessage = lastError;
      }
  }

  // 翻譯常見的 Quota 錯誤，讓使用者更容易理解
  if (errorMessage.toLowerCase().includes("quota") || errorMessage.includes("429")) {
      throw new Error("API 配額已額滿 (Rate Limit Exceeded)。請稍後再試，或檢查您的 Google AI Studio 方案是否已達上限。");
  }

  throw new Error(`搜尋失敗: ${errorMessage}`);
};