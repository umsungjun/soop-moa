// 닉네임은 누구나 같게 지을 수 있으므로 OAuth로 확인된 SOOP 아이디로만 운영자를 가린다.
const OPERATOR_IDS: ReadonlySet<string> = new Set(["umseongjun"]);

export const isOperator = (userId: string) => OPERATOR_IDS.has(userId);
