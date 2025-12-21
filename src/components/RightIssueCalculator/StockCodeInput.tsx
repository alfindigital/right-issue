import React from 'react';
import { Tag } from 'lucide-react';

interface StockCodeInputProps {
  value: string;
  onChange: (value: string) => void;
}

const StockCodeInput: React.FC<StockCodeInputProps> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    onChange(val);
  };

  return (
    <div className="card-calculator">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Kode Saham</span>
        <span className="text-xs text-muted-foreground">(opsional)</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="BRPT, MDKA, BRIS..."
        className="input-calculator text-center font-bold tracking-widest text-lg"
        maxLength={4}
      />
    </div>
  );
};

export default StockCodeInput;
