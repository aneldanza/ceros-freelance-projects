// Declaration for AMD module loading via RequireJS
declare global {
  // Simulate jQuery-like Deferred interface
  interface Deferred<T = any> {
    done(callback: (result: T) => void): Deferred<T>;
    fail(callback: (error: any) => void): Deferred<T>;
    always(callback: () => void): Deferred<T>;
    resolve(...args: any[]): Deferred<T>;
    reject(...args: any[]): Deferred<T>;
    state(): "pending" | "resolved" | "rejected";
  }

  type CerosSDKEvent =
    | "page.changed"
    | "page.changing"
    | "component.clicked"
    | "layer.shown"
    | "layer.hidden"
    | "folder.shown"
    | "folder.hidden"
    | "social.share"
    | "animation.started"
    | "animation.ended"
    | "video.played"
    | "context.value.response"
    | "user.consent";

  interface CerosSDKEvents {
    PAGE_CHANGED: "page.changed";
    PAGE_CHANGING: "page.changing";
    CLICKED: "component.clicked";
    SHOWN: "layer.shown";
    HIDDEN: "layer.hidden";
    FOLDER_SHOWN: "folder.shown";
    FOLDER_HIDDEN: "folder.hidden";
    SOCIAL_SHARE: "social.share";
    ANIMATION_STARTED: "animation.started";
    ANIMATION_ENDED: "animation.ended";
    VIDEO_PLAYED: "video.played";
    CONTEXT_VALUE_RESPONSE: "context.value.response";
    USER_CONSENT: "user.consent";

    // Deprecated (aliases for backward compatibility)
    COMPONENT_CLICKED: "component.clicked";
    LAYER_SHOWN: "layer.shown";
    LAYER_HIDDEN: "layer.hidden";
  }

  interface CerosPage {
    tags: string[];

    disable(): void;
    enable(): void;
    findAllComponents(): CerosComponentCollection;
    getPageNumber(): number;
    getTags(): string[];
  }

  interface CerosMessenger {
    [key: string]: any; // Add specific methods if known
  }

  class CerosLayer {
    id: string;
    type: string;
    tags: string[];
    payload: string;
    experience: Experience;
    experienceId: string;
    page: CerosPage;

    on(event: CerosSDKEvent, callback: (layer: CerosLayer) => void): void;

    getPage(): CerosPage;
    getPayload(): string;
    getTags(): string[];
    findAllComponents(): CerosComponentCollection;
    show(): void;
    hide(): void;
    setText(textContent: string): void;
    setUrl(url: string, useNewImageSize?: boolean): void;
    reset(): void;
  }

  class CerosComponent extends CerosLayer {
    click(): void;
    reset(): void;
    isVideoComponent(): boolean;
    startVideo(): void;
    stopVideo(): void;
    isTextComponent(): boolean;
    setText(text: string): void;
    reset(): void;

    [key: string]: any; // For additional dynamic properties
  }

  interface CerosLayerCollection {
    // Assuming LayerCollection has some shared methods.
    // If not known, this can be left empty or removed.
    layers: CerosLayer[];
    layersByTag: Record<string, CerosLayer[]>;

    [key: string]: any;
  }

  class CerosComponentCollection implements CerosLayerCollection {
    components: CerosComponent[];
    messenger: CerosMessenger;
    componentsByTag: Record<string, CerosComponent[]>;
    layers: CerosLayer[];
    layersByTag: Record<string, CerosLayer[]>;

    constructor(components: CerosComponent[], messenger: CerosMessenger);

    findComponentsByTag(tag: string): CerosComponentCollection;
    click(): void;
    reset(): void;
    startVideo(): void;
    stopVideo(): void;
    setText(textContent: string): void;
    show(): void;

    merge(
      otherCollections: CerosComponentCollection[]
    ): CerosComponentCollection;
    on(
      event: CerosSDKEvent,
      callback: (component: CerosComponent) => void
    ): void;

    static merge(
      collections: CerosComponentCollection[],
      messenger: CerosMessenger
    ): CerosComponentCollection;
  }

  class CerosPageCollection {
    pages: CerosPage[];

    constructor(pages: CerosPage[], messenger: CerosMessenger);
  }

  interface Experience {
    findPagesByTag(tag: string): CerosPageCollection;
    findComponentsByTag(tag: string): CerosComponentCollection;
    findLayersByTag(tag: string): CerosLayerCollection;
    goToNextPage(): void;
    goToPage(pageNum: number): void;

    on(event: CerosSDKEvent, callback: (page: CerosPage) => void): void;
  }

  interface CerosSDK {
    EVENTS: CerosSDKEvents;

    findExperience(id?: string): Deferred<Experience>;
  }

  interface Window {
    CerosSDK: CerosSDK;
  }
}

export {};
