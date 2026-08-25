export interface csvRecord {
    id: string;
    postId: string;
    name: string;
    email: string;
    pendingData: string | null;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    updatedBy: string;
}