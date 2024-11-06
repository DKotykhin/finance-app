import React from 'react';

import { colorsMap } from '@/utils';

interface AccountNameProps {
  color: string;
  accountName: string;
  isDefault: boolean;
}

export const AccountName: React.FC<AccountNameProps> = ({ color, accountName, isDefault }) => {
  return (
    <div className="relative w-fit">
      <div
        className="py-0.5 px-3 border-2 rounded-full truncate md:text-clip text-ellipsis max-w-[160px] md:max-w-fit"
        style={{
          borderColor: colorsMap.get(color)?.border,
          color: colorsMap.get(color)?.text,
          backgroundColor: colorsMap.get(color)?.bg,
        }}
      >
        {accountName}
      </div>
      {isDefault && (
        <div
          className="absolute top-0 right-0 w-2 h-2 rounded-full"
          style={{ backgroundColor: colorsMap.get(color)?.sample }}
        />
      )}
    </div>
  );
};
