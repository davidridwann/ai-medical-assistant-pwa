import React from 'react';
import type { XrayAnalysisResult } from '../types/parahita';
import { parseTelegramMarkdown } from '../utils/telegramMarkdown';
import './XrayResult.css';

interface XrayResultProps {
  analysis: XrayAnalysisResult;
}

/**
 * Component to display X-ray analysis results including heatmap image and AI interpretation
 */
export const XrayResult: React.FC<XrayResultProps> = ({ analysis }) => {
  const { prediction, aiInterpretation, inspection } = analysis;
  const heatmapDataUrl = `data:image/png;base64,${prediction.heatmap_base64}`;

  const getPredictionColor = () => {
    // Handle both "Normal"/"NORMAL" and "Abnormal"/"ABNORMAL" (case-insensitive)
    const pred = prediction.prediction.toUpperCase();
    return pred === 'NORMAL' ? '#28a745' : '#dc3545';
  };

  const getPredictionLabel = () => {
    // Handle both "Normal"/"NORMAL" and "Abnormal"/"ABNORMAL" (case-insensitive)
    const pred = prediction.prediction.toUpperCase();
    return pred === 'NORMAL' ? 'Normal' : 'Abnormal';
  };

  return (
    <div className="xray-result-container">
      <div className="xray-result-header">
        <h3 className="xray-result-title">Hasil Analisis X-Ray</h3>
        <span className="xray-result-type">{inspection}</span>
      </div>

      <div className="xray-result-image-container">
        <img
          src={heatmapDataUrl}
          alt="X-ray analysis with heatmap overlay"
          className="xray-result-image"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const container = target.parentElement;
            if (container) {
              container.innerHTML = '<div class="xray-image-error">Gagal memuat gambar</div>';
            }
          }}
        />
      </div>

      <div className="xray-result-prediction">
        <div
          className="xray-prediction-badge"
          style={{ backgroundColor: getPredictionColor() }}
        >
          <span className="xray-prediction-label">{getPredictionLabel()}</span>
          <span className="xray-prediction-confidence">
            {(prediction.confidence * 100).toFixed(1)}%
          </span>
        </div>
        <div className="xray-confidence-level">
          Tingkat Kepercayaan: {prediction.conclusion.confidence_level}
        </div>
      </div>

      <div className="xray-result-conclusion">
        <h4 className="xray-conclusion-title">Kesimpulan</h4>
        <p className="xray-conclusion-text">{prediction.conclusion.kesimpulan}</p>
        <p className="xray-conclusion-detail">{prediction.conclusion.hasil}</p>
      </div>

      {aiInterpretation && (
        <div className="xray-result-interpretation">
          <h4 className="xray-interpretation-title">Interpretasi AI</h4>
          <div className="xray-interpretation-text">
            {parseTelegramMarkdown(aiInterpretation)}
          </div>
        </div>
      )}
    </div>
  );
};
