declare module 'youtube-api' {
  export function authenticate ({ type, key }: { type: string, key: string }): void

  // tslint:disable-next-line
  export class search {
    public static list ({ maxResults, part, q, type }: { maxResults: number, part: string, q: string, type: string },
                        callback: (err: Error, data: IYouTubeResponse) => void): void
  }

  interface IVideo {
    id: {
      videoId: string
    }
    snippet: {
      title: string
    }
  }

  interface IYouTubeResponse {
    items: IVideo[]
  }
}
