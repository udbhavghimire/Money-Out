import React, { useState } from 'react';
import Input from './Input';

const YourComponent = () => {
  const [formData, setFormData] = useState({ amount: '' });

  return (
    <div>
      <Input
        type="number"
        step="0.01"
        placeholder="Enter Amount"
        value={formData.amount}
        onChange={(e) =>
          setFormData({ ...formData, amount: e.target.value })
        }
        className="text-center text-lg min-h-[3.5rem]"
        required
      />
    </div>
  );
};

export default YourComponent; 