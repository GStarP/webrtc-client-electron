import React, { createRef, useState } from 'react';

function SplitInput(props) {
  const { num, onChange } = props;
  const refs = new Array(num).fill(0).map((_) => createRef());
  const [values, setValues] = useState(new Array(num).fill(''));
  const [cursor, setCursor] = useState(0);

  const onSingleInputChange = (index) => {
    return (e) => {
      const oldVal = values[index];
      const newVal = e.target.value;
      let char =
        newVal.length <= 1
          ? newVal
          : newVal[0] === oldVal
          ? newVal[1]
          : newVal[0];
      char = char.toUpperCase();
      values[index] = char;
      onChange(values.join(''));

      setValues(values.slice());
      // input: forward cursor
      if (char !== '' && cursor + 1 < num) {
        refs[cursor + 1].current.focus();
        setCursor(cursor + 1);
      }
    };
  };

  return (
    <div className="split-input flex-row flex-center">
      {values.map((v, i) => (
        <input
          ref={refs[i]}
          key={`split-input_${i}`}
          value={v}
          onChange={onSingleInputChange(i)}
          onFocus={() => setCursor(i)}
        />
      ))}
    </div>
  );
}

export default SplitInput;
