declare namespace Papa {
  interface ParseResult<T> {
    data: T[];
    errors: any[];
    meta: any;
  }

  function parse<T>(
    input: string | File,
    config?: {
      header?: boolean;
      complete?: (results: ParseResult<T>) => void;
      [key: string]: any;
    }
  ): ParseResult<T>;
}
