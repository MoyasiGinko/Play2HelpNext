export interface ScoreDataInterface {
  game: string;
  score: number;
  tokens: number;
}

export interface TokenInfoInterface {
  id: number; 
  token_name: string; 
  token_symbol: string | null;
  solana_contract_address: string;
  bnb_contract_address: string | null;
  created_at: string;
  updated_at: string;
}
