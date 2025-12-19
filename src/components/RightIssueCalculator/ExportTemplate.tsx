import React from 'react';

interface ExportTemplateProps {
  data: {
    ratioOld: string;
    ratioNew: string;
    rightPrice: string;
    cumDatePrice: string;
    currentLots: string;
    currentAvgPrice: string;
    currentTotalValue: string;
    newSharesCount: string;
    newTotalValue: string;
    finalShares: string;
    finalAvgPrice: string;
    finalTotalValue: string;
    theoreticalPrice: string;
    recommendation: 'positive' | 'negative' | null;
    recommendationText: string;
    hasWarrant: boolean;
    warrantCount: string;
  };
}

const formatCurrency = (value: string | number): string => {
  const num = typeof value === 'string' ? parseInt(value) || 0 : value;
  return `Rp ${new Intl.NumberFormat('id-ID').format(num)}`;
};

const ExportTemplate: React.FC<ExportTemplateProps> = ({ data }) => {
  return (
    <div 
      id="export-template"
      style={{
        width: '480px',
        padding: '24px',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f1c2e 100%)',
        fontFamily: "'Poppins', sans-serif",
        color: '#ffffff',
        borderRadius: '16px',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          margin: '0 0 4px 0',
          color: '#ffffff'
        }}>
          Kalkulator Right Issue
        </h1>
        <p style={{ 
          fontSize: '11px', 
          color: 'rgba(255,255,255,0.6)',
          margin: 0 
        }}>
          Hasil Kalkulasi • {new Date().toLocaleDateString('id-ID')}
        </p>
      </div>

      {/* Info RI */}
      <div style={{ 
        background: 'rgba(255,255,255,0.08)', 
        borderRadius: '10px', 
        padding: '14px',
        marginBottom: '12px'
      }}>
        <h2 style={{ 
          fontSize: '11px', 
          fontWeight: '600', 
          color: 'rgba(255,255,255,0.7)',
          margin: '0 0 10px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Info Right Issue
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Rasio</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{data.ratioOld} : {data.ratioNew}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Harga RI</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{formatCurrency(data.rightPrice)}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Harga Cum Date</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{formatCurrency(data.cumDatePrice)}</div>
          </div>
        </div>
      </div>

      {/* Kepemilikan */}
      <div style={{ 
        background: 'rgba(255,255,255,0.08)', 
        borderRadius: '10px', 
        padding: '14px',
        marginBottom: '12px'
      }}>
        <h2 style={{ 
          fontSize: '11px', 
          fontWeight: '600', 
          color: 'rgba(255,255,255,0.7)',
          margin: '0 0 10px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Kepemilikan
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Lot Saat Ini</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{parseInt(data.currentLots).toLocaleString('id-ID')} lot</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Harga Avg</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{formatCurrency(data.currentAvgPrice)}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Total Value</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{data.currentTotalValue}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Jatah RI</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{data.newSharesCount} lembar</div>
          </div>
        </div>
      </div>

      {/* Hasil Akhir */}
      <div style={{ 
        background: 'rgba(59, 130, 246, 0.2)', 
        borderRadius: '10px', 
        padding: '14px',
        marginBottom: '12px',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }}>
        <h2 style={{ 
          fontSize: '11px', 
          fontWeight: '600', 
          color: '#60a5fa',
          margin: '0 0 10px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Setelah Tebus RI
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Total Lembar</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{data.finalShares}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Biaya Tebus</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{data.newTotalValue}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Avg Baru</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#60a5fa' }}>{data.finalAvgPrice}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>TERP</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#60a5fa' }}>{data.theoreticalPrice}</div>
          </div>
        </div>
        {data.hasWarrant && (
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Bonus Waran</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{data.warrantCount}</div>
          </div>
        )}
      </div>

      {/* Recommendation */}
      {data.recommendation && (
        <div style={{ 
          background: data.recommendation === 'positive' 
            ? 'rgba(34, 197, 94, 0.15)' 
            : 'rgba(239, 68, 68, 0.15)', 
          borderRadius: '10px', 
          padding: '12px',
          marginBottom: '16px',
          border: `1px solid ${data.recommendation === 'positive' 
            ? 'rgba(34, 197, 94, 0.3)' 
            : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          <p style={{ 
            fontSize: '12px', 
            fontWeight: '500',
            color: data.recommendation === 'positive' ? '#4ade80' : '#f87171',
            margin: 0,
            lineHeight: '1.5'
          }}>
            {data.recommendationText}
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        textAlign: 'center',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <p style={{ 
          fontSize: '10px', 
          color: 'rgba(255,255,255,0.4)',
          margin: 0 
        }}>
          alfindigital.com • Bukan saran investasi
        </p>
      </div>
    </div>
  );
};

export default ExportTemplate;
