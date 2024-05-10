export type Row = {
    year: string;
    month: string;
    url: string;
  };
  
  export type MonthData = {
      label: string;
      url: string
  }
  
  export type Data = {
    [key: string]: {
      months: MonthData[];
    };
  };