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
      complete?: (results: ParseResult<Record<string, string>>) => void;
      [key: string]: any;
    }
  ): ParseResult<T>;
}
