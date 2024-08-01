export interface BlogComment {
    id?: string;
    userId : number;
    username: string;
    blogId : string;
    text: string;
    creationTime : Date;
    lastModification : Date;
}