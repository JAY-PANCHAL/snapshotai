import { useState, useRef, useCallback } from 'react';
import { fileToDataUrl, fileToBase64, cropAndResize, ASPECT_RATIOS } from '../utils/imageUtils';
import { usePhotoAnalysis } from '../utils/claudeApi';
import styles from './PhotoUploader.module.css';

export default function PhotoUploader({ onPhotoReady }) {
  const [preview, setPreview] = useState(null);
  const [base64, setBase64] = useState(null);
  const [mediaType, setMediaType] = useState('image/jpeg');
  const [cropRatio, setCropRatio] = useState('1:1');
  const [croppedPreview, setCroppedPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();
  const { analysis, loading, error, analyzePhoto } = usePhotoAnalysis();

  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const mt = file.type || 'image/jpeg';
    setMediaType(mt);

    const dataUrl = await fileToDataUrl(file);
    setPreview(dataUrl);

    const b64 = await fileToBase64(file);
    setBase64(b64);

    // auto crop to selected ratio
    const cropped = await cropAndResize(dataUrl, ASPECT_RATIOS[cropRatio], 800);
    setCroppedPreview(cropped);

    // analyze
    const result = await analyzePhoto(b64, mt);

    onPhotoReady?.({
      dataUrl: cropped,
      base64: b64,
      mediaType: mt,
      analysis: result,
    });
  }, [cropRatio, analyzePhoto, onPhotoReady]);

  const handleCropChange = useCallback(async (ratio) => {
    setCropRatio(ratio);
    if (preview) {
      const cropped = await cropAndResize(preview, ASPECT_RATIOS[ratio], 800);
      setCroppedPreview(cropped);
    }
  }, [preview]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const scoreColor = (s) => s >= 8 ? '#22c55e' : s >= 6 ? '#c9a84c' : '#ef4444';

  return (
    <div className={styles.wrap} id="upload-section">
      <div className={styles.header}>
        <span className={styles.sectionLabel}>Step 1</span>
        <h2 className={styles.title}>Upload & Analyze Your Photo</h2>
        <p className={styles.sub}>Our AI will analyze your photo quality, lighting, framing, and suggest improvements</p>
      </div>

      <div className={styles.grid}>
        {/* Upload zone */}
        <div className={styles.uploadCol}>
          <div
            className={`${styles.dropZone} ${dragging ? styles.dragging : ''} ${preview ? styles.hasPhoto : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !preview && inputRef.current?.click()}
          >
            {!preview ? (
              <div className={styles.dropContent}>
                <div className={styles.uploadIcon}>↑</div>
                <p className={styles.dropTitle}>Drop your photo here</p>
                <p className={styles.dropSub}>or click to browse</p>
                <p className={styles.dropHint}>JPG, PNG, WEBP · Max 10MB</p>
                <button
                  className={styles.browseBtn}
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                >
                  Choose Photo
                </button>
              </div>
            ) : (
              <div className={styles.previewWrap}>
                <img
                  src={croppedPreview || preview}
                  alt="Preview"
                  className={styles.previewImg}
                />
                <button
                  className={styles.changeBtn}
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                >
                  Change Photo
                </button>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => processFile(e.target.files[0])}
          />

          {/* Crop ratio selector */}
          {preview && (
            <div className={styles.cropRow}>
              <span className={styles.cropLabel}>Crop Format:</span>
              {Object.keys(ASPECT_RATIOS).map(r => (
                <button
                  key={r}
                  className={`${styles.cropBtn} ${cropRatio === r ? styles.cropActive : ''}`}
                  onClick={() => handleCropChange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Analysis panel */}
        <div className={styles.analysisCol}>
          {!preview && !loading && (
            <div className={styles.analysisEmpty}>
              <div className={styles.analysisEmptyIcon}>🔍</div>
              <p>Upload a photo to get AI analysis</p>
              <p className={styles.analysisEmptySub}>We'll check lighting, framing, quality, and more</p>
            </div>
          )}

          {loading && (
            <div className={styles.analysisLoading}>
              <div className={styles.spinner} />
              <p>Analyzing your photo...</p>
              <p className={styles.loadingSub}>Checking lighting, face detection, quality score</p>
            </div>
          )}

          {error && (
            <div className={styles.analysisError}>
              <p className={styles.errorTitle}>Analysis unavailable</p>
              <p className={styles.errorSub}>{error}</p>
              <p className={styles.errorNote}>You can still use the template selector below.</p>
            </div>
          )}

          {analysis && !loading && (
            <div className={styles.analysisResult}>
              {/* Score */}
              <div className={styles.scoreRow}>
                <div className={styles.scoreCircle} style={{ borderColor: scoreColor(analysis.overallScore) }}>
                  <span className={styles.scoreNum} style={{ color: scoreColor(analysis.overallScore) }}>
                    {analysis.overallScore}
                  </span>
                  <span className={styles.scoreDen}>/10</span>
                </div>
                <div>
                  <p className={styles.scoreTitle}>Photo Quality Score</p>
                  <p className={styles.scoreStatus} style={{ color: scoreColor(analysis.overallScore) }}>
                    {analysis.overallScore >= 8 ? 'Excellent — Ready to use!' : analysis.overallScore >= 6 ? 'Good — Small improvements possible' : 'Fair — Consider retaking'}
                  </p>
                </div>
              </div>

              <div className={styles.divider} />

              {/* Details grid */}
              <div className={styles.detailGrid}>
                {[
                  { label: 'Lighting', value: analysis.lighting },
                  { label: 'Background', value: analysis.background },
                  { label: 'Framing', value: analysis.framing },
                  { label: 'Expression', value: analysis.expression },
                  { label: 'Attire', value: analysis.attire },
                  { label: 'Quality', value: analysis.quality },
                ].map(d => (
                  <div key={d.label} className={styles.detailItem}>
                    <span className={styles.detailLabel}>{d.label}</span>
                    <span className={styles.detailValue}>{d.value || '—'}</span>
                  </div>
                ))}
              </div>

              {/* Issues */}
              {analysis.issues?.length > 0 && (
                <div className={styles.issueBox}>
                  <p className={styles.issueTitle}>⚠ Issues Found</p>
                  <ul className={styles.issueList}>
                    {analysis.issues.map((iss, i) => <li key={i}>{iss}</li>)}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions?.length > 0 && (
                <div className={styles.suggestBox}>
                  <p className={styles.suggestTitle}>✓ Suggestions</p>
                  <ul className={styles.suggestList}>
                    {analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {/* Recommended crops */}
              {analysis.bestCrops?.length > 0 && (
                <div className={styles.cropRecommend}>
                  <p className={styles.cropRecTitle}>Recommended formats:</p>
                  <div className={styles.cropTags}>
                    {analysis.bestCrops.map(c => (
                      <span key={c} className={styles.cropTag}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
