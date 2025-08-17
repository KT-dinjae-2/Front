import React, { useState } from 'react';
import axios from 'axios';

// --- 데이터 영역 ---
const DONGS_DATA = [
  { id: 1, name: '왕십리도선동' }, { id: 2, name: '왕십리2동' },
  { id: 3, name: '마장동' }, { id: 4, name: '사근동' },
  { id: 5, name: '행당1동' }, { id: 6, name: '행당2동' },
  { id: 7, name: '응봉동' }, { id: 8, name: '금호1가동' },
  { id: 9, name: '금호2-3가동'}, { id: 10, name: '금호4가동' },
  { id: 11, name: '옥수동' }, { id: 12, name: '성수1가제1동' },
  { id: 13, name: '성수1가제2동'}, { id: 14, name: '성수2가제1동' },
  { id: 15, name: '성수2가제3동'}, { id: 16, name: '송정동' },
  { id: 17, name: '용답동' }
];

const ALL_STORES = [
    { id: 1, name: '대촌정' }, { id: 2, name: '홍익슈퍼' }, { id: 3, name: '성은참머리사랑' }, 
    { id: 4, name: '아롱다롱' }, { id: 5, name: '모모분식' }, { id: 6, name: '애정가득찬' }, 
    { id: 7, name: '본도시락' }, { id: 8, name: '찰리베이커리' }, { id: 9, name: '송하정' }, 
    { id: 10, name: '돌삼겹나들목' }, { id: 11, name: '청담찬(주민자치)' }, { id: 12, name: '파리바게뜨 왕십리무학점' }, 
    { id: 13, name: '부부슈퍼(부녀회)' }, { id: 14, name: '오는정숯불갈비' }, { id: 15, name: '해늘김밥' }, 
    { id: 16, name: '파리바게트 마장대로점' }, { id: 17, name: '화성상회' }, { id: 18, name: '래래' }, 
    { id: 19, name: '귀빈미용실' }, { id: 20, name: '파리바게트 마장역점' }, { id: 21, name: '선미용실' }, 
    { id: 22, name: '마주보고카페' }, { id: 23, name: '통통갈비' }, { id: 24, name: '원조콩나물국밥' }, 
    { id: 25, name: '행복한빵집' }, { id: 26, name: '사근정육점' }, { id: 27, name: '명희네칼국수' }, 
    { id: 28, name: '헤어204' }, { id: 29, name: '덤앤더머' }, { id: 30, name: '더진국수육국밥' }, 
    { id: 31, name: '종점토스트' }, { id: 32, name: '참진한 순대국' }, { id: 33, name: '장가축산' }, 
    { id: 34, name: '전주 콩나물 해장국' }, { id: 35, name: '형부네할인마트' }, { id: 36, name: '병천순대' }, 
    { id: 37, name: '파리바게트 성동구민회관점' }, { id: 38, name: '함지박' }, { id: 39, name: '롯데리아 성동구청점' }, 
    { id: 40, name: '옛고을오리훈제' }, { id: 41, name: '더리즌' }, { id: 42, name: '왕가아구찜' }, 
    { id: 43, name: '마포갈비' }, { id: 44, name: '조조반점' }, { id: 45, name: '롯데리아_행당2동점' }, 
    { id: 46, name: '산마을순대국' }, { id: 47, name: '소금구이' }, { id: 48, name: '파리바게트 응봉점' }, 
    { id: 49, name: '성동중구 우유대리점' }, { id: 50, name: '벽산하이마트' }, { id: 51, name: '유경헤어' }, 
    { id: 52, name: '덕흥정육점' }, { id: 53, name: '정드린찬_금호1가동점' }, { id: 54, name: '박진희헤어필' }, 
    { id: 55, name: '성동두레' }, { id: 56, name: '장미식당' }, { id: 57, name: '수미떡' }, 
    { id: 58, name: '먹깨비식당' }, { id: 59, name: '원조칼국수' }, { id: 60, name: '인애미용실' }, 
    { id: 61, name: '파리바게뜨 신금호역점' }, { id: 62, name: '정드린찬_금호2-3가동점' }, { id: 63, name: '미소김밥' }, 
    { id: 64, name: '색연필' }, { id: 65, name: '맛있는떡집' }, { id: 66, name: '신금호숯불갈비' }, 
    { id: 67, name: '돈경' }, { id: 68, name: '롯데리아_금호2-3가동점' }, { id: 69, name: '금호2-3가동 주민자치회' }, 
    { id: 70, name: '가보자' }, { id: 71, name: '정은회관' }, { id: 72, name: '금옥정' }, 
    { id: 73, name: '소연미용실' }, { id: 74, name: '독서당인문아카데미' }, { id: 75, name: '깐부치킨' }, 
    { id: 76, name: '장군숯불갈비' }, { id: 77, name: '노리터' }, { id: 78, name: '한우생고기 잭' }, 
    { id: 79, name: '양지생고기' }, { id: 80, name: '한촌설렁탕' }, { id: 81, name: '고흥만' }, 
    { id: 82, name: '승리원' }, { id: 83, name: '회현집' }, { id: 84, name: '키베이커리' }, 
    { id: 85, name: '메모레' }, { id: 86, name: '대성갈비' }, { id: 87, name: '훼미리손칼국수' }, 
    { id: 88, name: '롤루랄라 치킨호프' }, { id: 89, name: '맛드리반찬' }, { id: 90, name: '솔래감자탕' }, 
    { id: 91, name: '비밀의정원' }, { id: 92, name: '아오미' }, { id: 93, name: '커피로그리는꿈' }, 
    { id: 94, name: '매너커피' }, { id: 95, name: 'GS25성수영진점' }, { id: 96, name: '죽변항' }, 
    { id: 97, name: '우돈만족' }, { id: 98, name: '이랑칼국수' }, { id: 99, name: '전주식당' }, 
    { id: 100, name: '하루나' }, { id: 101, name: '호랑이식탁' }, { id: 102, name: '은식당' }, 
    { id: 103, name: '오부대찌개' }, { id: 104, name: '성수낙지' }, { id: 105, name: '삼천만횟집' }, 
    { id: 106, name: '카페페롤' }, { id: 107, name: '엄마네냄비밥' }, { id: 108, name: '김성기미용실' }, 
    { id: 109, name: '금돼지' }, { id: 110, name: '롯데리아 성수역점' }, { id: 111, name: '아랫목식당' }, 
    { id: 112, name: '수주머리나라' }, { id: 113, name: '한영마트' }, { id: 114, name: '꾸리찌바' }, 
    { id: 115, name: '명품세탁소' }, { id: 116, name: '지하대피소' }, { id: 117, name: '베이커리니트' }, 
    { id: 118, name: '동수원' }, { id: 119, name: '팔자보' }, { id: 120, name: '목포식당' }, 
    { id: 121, name: '대도식당' }, { id: 122, name: '장미슈퍼' }, { id: 123, name: '복촌목은지삼겹살' }, 
    { id: 124, name: '교촌' }, { id: 125, name: '미향' }, { id: 126, name: '오피스넥스' }
];

const RELATIONS = [
    { dong: 1, store: 1 }, { dong: 1, store: 2 }, { dong: 1, store: 3 }, { dong: 1, store: 4 },
    { dong: 1, store: 5 }, { dong: 1, store: 6 }, { dong: 1, store: 7 }, { dong: 1, store: 8 },
    { dong: 2, store: 9 }, { dong: 2, store: 10 }, { dong: 2, store: 11 }, { dong: 2, store: 12 },
    { dong: 2, store: 13 }, { dong: 2, store: 14 }, { dong: 2, store: 15 }, { dong: 3, store: 16 },
    { dong: 3, store: 17 }, { dong: 3, store: 18 }, { dong: 3, store: 19 }, { dong: 3, store: 20 },
    { dong: 3, store: 21 }, { dong: 3, store: 22 }, { dong: 3, store: 23 }, { dong: 4, store: 24 },
    { dong: 4, store: 25 }, { dong: 4, store: 26 }, { dong: 4, store: 27 }, { dong: 4, store: 28 },
    { dong: 4, store: 29 }, { dong: 4, store: 30 }, { dong: 4, store: 31 }, { dong: 4, store: 32 },
    { dong: 5, store: 33 }, { dong: 5, store: 34 }, { dong: 5, store: 35 }, { dong: 5, store: 36 },
    { dong: 5, store: 37 }, { dong: 5, store: 38 }, { dong: 5, store: 39 }, { dong: 5, store: 40 },
    { dong: 6, store: 41 }, { dong: 6, store: 42 }, { dong: 6, store: 43 }, { dong: 6, store: 44 },
    { dong: 6, store: 45 }, { dong: 6, store: 46 }, { dong: 7, store: 47 }, { dong: 7, store: 48 },
    { dong: 8, store: 49 }, { dong: 8, store: 50 }, { dong: 8, store: 51 }, { dong: 8, store: 52 },
    { dong: 8, store: 53 }, { dong: 8, store: 54 }, { dong: 8, store: 55 }, { dong: 8, store: 56 },
    { dong: 8, store: 57 }, { dong: 9, store: 58 }, { dong: 9, store: 59 }, { dong: 9, store: 60 },
    { dong: 9, store: 61 }, { dong: 9, store: 62 }, { dong: 9, store: 63 }, { dong: 9, store: 64 },
    { dong: 9, store: 65 }, { dong: 9, store: 66 }, { dong: 9, store: 67 }, { dong: 9, store: 68 },
    { dong: 9, store: 69 }, { dong: 10, store: 70 }, { dong: 10, store: 71 }, { dong: 10, store: 72 },
    { dong: 10, store: 73 }, { dong: 10, store: 74 }, { dong: 10, store: 75 }, { dong: 11, store: 76 },
    { dong: 11, store: 77 }, { dong: 11, store: 78 }, { dong: 11, store: 79 }, { dong: 11, store: 80 },
    { dong: 12, store: 81 }, { dong: 12, store: 82 }, { dong: 12, store: 83 }, { dong: 12, store: 84 },
    { dong: 12, store: 85 }, { dong: 13, store: 86 }, { dong: 13, store: 87 }, { dong: 13, store: 88 },
    { dong: 13, store: 89 }, { dong: 13, store: 90 }, { dong: 13, store: 91 }, { dong: 13, store: 92 },
    { dong: 13, store: 93 }, { dong: 13, store: 94 }, { dong: 13, store: 95 }, { dong: 13, store: 96 },
    { dong: 14, store: 97 }, { dong: 14, store: 98 }, { dong: 14, store: 99 }, { dong: 14, store: 100 },
    { dong: 14, store: 101 }, { dong: 14, store: 102 }, { dong: 14, store: 103 }, { dong: 15, store: 104 },
    { dong: 15, store: 105 }, { dong: 15, store: 106 }, { dong: 15, store: 107 }, { dong: 15, store: 108 },
    { dong: 15, store: 109 }, { dong: 15, store: 110 }, { dong: 16, store: 111 }, { dong: 16, store: 112 },
    { dong: 16, store: 113 }, { dong: 16, store: 114 }, { dong: 16, store: 115 }, { dong: 16, store: 116 },
    { dong: 16, store: 117 }, { dong: 17, store: 118 }, { dong: 17, store: 119 }, { dong: 17, store: 120 },
    { dong: 17, store: 121 }, { dong: 17, store: 122 }, { dong: 17, store: 123 }, { dong: 17, store: 124 },
    { dong: 17, store: 125 }, { dong: 17, store: 126 }
];

const STORES_BY_DONG = {};
DONGS_DATA.forEach(dong => {
  const relevantRelations = RELATIONS.filter(rel => rel.dong === dong.id);
  const storeIds = relevantRelations.map(rel => rel.store);
  const storesInDong = ALL_STORES.filter(store => storeIds.includes(store.id));
  STORES_BY_DONG[dong.id] = storesInDong;
});

// 임시 기부 코드 (실제로는 백엔드에서 가게별로 관리해야 함)
const CORRECT_DONATION_CODE = "1234";

// --- 컴포넌트 영역 ---

// 기부 완료 화면 컴포넌트
const DonationSuccessScreen = ({ amount, onGoBack }) => {
  return (
    <div style={styles.safeArea}>
      <div style={styles.successContainer}>
        <span style={styles.icon}>✅</span>
        <h1 style={styles.successTitle}>참여해주셔서 감사합니다!</h1>
        <p style={styles.successSubtitle}>
          {amount.toLocaleString()}원의 소중한 마음이 전달되었습니다.
        </p>
        <button style={styles.button} onClick={onGoBack}>
          돌아가기
        </button>
      </div>
    </div>
  );
};

// 기부 입력 화면 컴포넌트
const DonationEntryScreen = ({ onDonationSuccess }) => {
  const [selectedDongId, setSelectedDongId] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [stores, setStores] = useState([]);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationCode, setDonationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDongChange = (dongId) => {
    const id = parseInt(dongId, 10) || null;
    setSelectedDongId(id);
    setSelectedStoreId('');
    setStores(id ? STORES_BY_DONG[id] || [] : []);
  };

  const processDonation = async () => {
      setIsSubmitting(true);
      const API_BASE_URL = 'http://43.202.137.139:8000/api';
      const donationData = {
          dong: selectedDongId,
          store: selectedStoreId,
          amount: parseInt(donationAmount, 10),
          donation_date: new Date().toISOString().split('T')[0],
      };

      try {
          const response = await axios.post(`${API_BASE_URL}/donation/create/`, donationData);
          if (response.status === 201) {
              onDonationSuccess(parseInt(donationAmount, 10)); // 성공 시 App 상태 변경
          }
      } catch (error) {
          console.error('기부 처리 중 오류 발생:', error);
          alert('오류: 기부 내역 등록 중 문제가 발생했습니다.');
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDonateClick = () => {
    if (!selectedDongId || !selectedStoreId || !donationAmount) {
      alert('입력 오류: 모든 필수 항목을 입력해주세요.');
      return;
    }

    const dongName = DONGS_DATA.find(d => d.id === selectedDongId)?.name;
    const storeName = ALL_STORES.find(s => s.id === selectedStoreId)?.name;
    
    const confirmationMessage = `
      아래 내용으로 기부하시겠습니까?

      - 동: ${dongName}
      - 가게: ${storeName}
      - 금액: ${parseInt(donationAmount, 10).toLocaleString()}원
    `;

    if (window.confirm(confirmationMessage)) {
      if (donationCode === CORRECT_DONATION_CODE) {
        processDonation();
      } else {
        alert('기부 코드가 잘못되었습니다. 가게에 문의해주세요.');
      }
    }
  };

  return (
    <div style={styles.safeArea}>
      <header style={styles.header}>
        <span style={styles.logo}>☘️</span>
        <h1 style={styles.title}>성동 원플러스원</h1>
        <p style={styles.subtitle}>기부 내역 입력</p>
      </header>
      <main style={styles.container}>
        <div style={styles.formContainer}>
          <label style={styles.label}>동을 선택해 주세요</label>
          <div style={styles.pickerContainer}>
            <select style={styles.picker} value={selectedDongId || ''} onChange={(e) => handleDongChange(e.target.value)}>
              <option value="">동을 선택하세요</option>
              {DONGS_DATA.map((dong) => <option key={dong.id} value={dong.id}>{dong.name}</option>)}
            </select>
          </div>
          <label style={styles.label}>가게를 선택해 주세요</label>
          <div style={styles.pickerContainer}>
            <select style={styles.picker} value={selectedStoreId || ''} onChange={(e) => setSelectedStoreId(parseInt(e.target.value, 10))} disabled={stores.length === 0}>
              <option value="">{selectedDongId ? "가게를 선택하세요" : "동을 먼저 선택해주세요"}</option>
              {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
          </div>
          <label style={styles.label}>기부 금액을 적어주세요</label>
          <input style={styles.input} type="number" placeholder="기부 금액" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} />
          <label style={styles.label}>기부 코드를 입력해주세요 (가게에 문의해주세요)</label>
          <input style={styles.input} placeholder="기부 코드 (테스트: 1234)" value={donationCode} onChange={(e) => setDonationCode(e.target.value)}/>
        </div>
        <button style={styles.button} onClick={handleDonateClick} disabled={isSubmitting}>
          {isSubmitting ? '처리 중...' : '기부 참여하기'}
        </button>
      </main>
    </div>
  );
};

// --- 메인 App 컴포넌트 ---
// 화면 전환을 관리합니다.
const App = () => {
    const [currentScreen, setCurrentScreen] = useState('entry'); // 'entry' 또는 'success'
    const [finalAmount, setFinalAmount] = useState(0);

    const handleDonationSuccess = (amount) => {
        setFinalAmount(amount);
        setCurrentScreen('success');
    };

    const handleGoBack = () => {
        setFinalAmount(0);
        setCurrentScreen('entry');
    };

    if (currentScreen === 'success') {
        return <DonationSuccessScreen amount={finalAmount} onGoBack={handleGoBack} />;
    }
    
    return <DonationEntryScreen onDonationSuccess={handleDonationSuccess} />;
};

// --- 스타일 영역 ---
const styles = {
  safeArea: { fontFamily: 'sans-serif', backgroundColor: '#FFFFFF', minHeight: '100vh' },
  header: { backgroundColor: '#228B22', padding: '50px 20px 30px 20px', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px', textAlign: 'center', color: 'white' },
  logo: { fontSize: '32px', marginBottom: '12px' },
  title: { fontSize: '26px', fontWeight: 'bold', margin: 0 },
  subtitle: { fontSize: '18px', margin: '5px 0 0 0' },
  container: { padding: '24px' },
  formContainer: { marginBottom: '32px' },
  label: { fontSize: '16px', fontWeight: '500', color: '#333', marginBottom: '8px', display: 'block' },
  pickerContainer: { borderWidth: '1.5px', borderColor: '#228B22', borderRadius: '12px', marginBottom: '20px', backgroundColor: '#FFF', overflow: 'hidden' },
  picker: { width: '100%', padding: '14px', border: 'none', fontSize: '16px', backgroundColor: 'transparent', appearance: 'none' },
  input: { width: '100%', boxSizing: 'border-box', borderWidth: '1.5px', borderStyle: 'solid', borderColor: '#228B22', borderRadius: '12px', padding: '14px', fontSize: '16px', backgroundColor: '#FFF', marginBottom: '20px' },
  button: { width: '100%', backgroundColor: '#007AFF', color: '#FFFFFF', padding: '18px', borderRadius: '12px', textAlign: 'center', border: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' },
  // 성공 화면 스타일
  successContainer: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '24px' },
  icon: { fontSize: '80px', marginBottom: '24px' },
  successTitle: { fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' },
  successSubtitle: { fontSize: '18px', color: '#555', textAlign: 'center', marginBottom: '40px' },
};

export default App;