import { GadgetStatus } from "@prisma/client";

export interface GadgetsType{
    status: GadgetStatus;
    id: string;
    codename: string;
    decommissionedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;

}