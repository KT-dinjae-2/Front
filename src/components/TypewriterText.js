import React, { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';

// 텍스트를 한 글자씩 드러내는 타자기 효과.
// - 마운트 시 1회 애니메이션 (text 가 바뀌면 다시 시작)
// - onUpdate: 타이핑 진행 중 스크롤 등을 위해 주기적으로 호출
const TypewriterText = ({ text = '', style, speed = 16, animate = true, onUpdate, onDone }) => {
  const [count, setCount] = useState(animate ? 0 : text.length);
  const idxRef = useRef(0);

  useEffect(() => {
    if (!animate) {
      setCount(text.length);
      if (onDone) onDone();
      return undefined;
    }
    idxRef.current = 0;
    setCount(0);
    const id = setInterval(() => {
      idxRef.current += 1;
      setCount(idxRef.current);
      if (onUpdate && idxRef.current % 4 === 0) onUpdate();
      if (idxRef.current >= text.length) {
        clearInterval(id);
        if (onUpdate) onUpdate();
        if (onDone) onDone();
      }
    }, speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <Text style={style}>{text.slice(0, count)}</Text>;
};

export default TypewriterText;
