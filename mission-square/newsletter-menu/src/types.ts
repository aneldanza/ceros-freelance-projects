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

  export type PanelData = {
    open: boolean;
    close: (
          focusableElement?:
            | HTMLElement
            | React.MutableRefObject<HTMLElement | null>
            | undefined
        ) => void;
    key: string;
  } 