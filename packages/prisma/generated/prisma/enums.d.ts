export declare const Platform: {
    readonly email: "email";
    readonly telegram: "telegram";
    readonly slack: "slack";
    readonly openai: "openai";
    readonly discord: "discord";
};
export type Platform = (typeof Platform)[keyof typeof Platform];
export declare const WorkflowStatus: {
    readonly Pending: "Pending";
    readonly Complete: "Complete";
    readonly Error: "Error";
};
export type WorkflowStatus = (typeof WorkflowStatus)[keyof typeof WorkflowStatus];
export declare const NodeStatus: {
    readonly Pending: "Pending";
    readonly Running: "Running";
    readonly Success: "Success";
    readonly Failed: "Failed";
    readonly Skipped: "Skipped";
};
export type NodeStatus = (typeof NodeStatus)[keyof typeof NodeStatus];
//# sourceMappingURL=enums.d.ts.map