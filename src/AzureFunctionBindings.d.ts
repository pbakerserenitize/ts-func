export interface BindingBase {
    /**
     * The data type hint for the binding parameter (string, binary, or stream).
     */
    dataType?: DataType;
    direction: BindingBaseDirection;
    name: string;
    type: string;
}
/**
 * The data type hint for the binding parameter (string, binary, or stream).
 */
export declare type DataType = 'binary' | 'stream' | 'string';
export declare type BindingBaseDirection = 'in' | 'inout' | 'out';
export interface ServiceBusBinding extends BindingBase {
    /**
     * The permission level of the service bus connection string used by this binding.
     */
    accessRights?: AccessRights;
    /**
     * An app setting (or environment variable) with the service bus connection string to be
     * used by this binding.
     */
    connection?: string;
    /**
     * The service bus queue to monitor (if using a queue)
     */
    queueName?: string;
    /**
     * The topic subscription name
     */
    subscriptionName?: string;
    /**
     * The service bus topic to monitor (if using a queue)
     */
    topicName?: string;
    direction: ServiceBusBindingDirection;
    type: ServiceBusBindingType;
}
/**
 * The permission level of the service bus connection string used by this binding.
 */
export declare type AccessRights = 'listen' | 'manage';
export declare type ServiceBusBindingDirection = 'in' | 'out';
export declare type ServiceBusBindingType = 'serviceBus' | 'serviceBusTrigger';
export interface BlobBinding extends BindingBase {
    /**
     * An app setting (or environment variable) with the storage connection string to be used by
     * this binding.
     */
    connection?: string;
    /**
     * The path to the blob container
     */
    path?: string;
    direction: BlobBindingDirection;
    type: BlobBindingType;
}
export declare type BlobBindingDirection = 'in';
export declare type BlobBindingType = 'blob' | 'blobTrigger';
export interface ManualTriggerBinding extends BindingBase {
    direction: BlobBindingDirection;
    type: ManualTriggerBindingType;
}
export declare type ManualTriggerBindingType = 'manualTrigger';
export interface EventHubBinding extends BindingBase {
    /**
     * The event hub connection string setting.
     */
    connection?: string;
    /**
     * The event hub path.
     */
    path?: string;
    direction: ServiceBusBindingDirection;
    type: EventHubBindingType;
    /**
     * The cardinality hint for the input binding parameter (single message or array of
     * messages).
     */
    cardinality?: Cardinality;
    /**
     * The event hub consumer group.
     */
    consumerGroup?: string;
}
/**
 * The cardinality hint for the input binding parameter (single message or array of
 * messages).
 */
export declare type Cardinality = 'many' | 'one';
export declare type EventHubBindingType = 'eventHub' | 'eventHubTrigger';
export interface TimerTriggerBinding extends BindingBase {
    direction: BlobBindingDirection;
    /**
     * When true, your timer function will be invoked immediately after a runtime restart and
     * on-schedule thereafter.
     */
    runOnStartup?: boolean;
    /**
     * A cron expression of the format '{second} {minute} {hour} {day} {month} {day of week}' to
     * specify the schedule.
     */
    schedule?: string;
    type: TimerTriggerBindingType;
    /**
     * When true, schedule will be persisted to aid in maintaining the correct schedule even
     * through restarts. Defaults to true for schedules with interval >= 1 minute.
     */
    useMonitor?: boolean;
}
export declare type TimerTriggerBindingType = 'timerTrigger';
export interface QueueBinding extends BindingBase {
    /**
     * An app setting (or environment variable) with the storage connection string to be used by
     * this binding.
     */
    connection?: string;
    /**
     * The queue name.
     */
    queueName?: string;
    direction: ServiceBusBindingDirection;
    type: QueueBindingType;
}
export declare type QueueBindingType = 'queue' | 'queueTrigger';
export interface HTTPBinding extends BindingBase {
    direction: ServiceBusBindingDirection;
    type: HTTPBindingType;
    /**
     * The function HTTP authorization level.
     */
    authLevel?: AuthLevel;
    methods?: Method[];
    /**
     * The function HTTP route template.
     */
    route?: string;
    /**
     * The type of WebHook handled by the trigger (if handling a pre-defined WebHook).
     */
    webHookType?: string;
}
/**
 * The function HTTP authorization level.
 */
export declare type AuthLevel = 'admin' | 'anonymous' | 'function';
export declare type Method = 'delete' | 'get' | 'head' | 'options' | 'patch' | 'post' | 'put' | 'trace';
export declare type HTTPBindingType = 'http' | 'httpTrigger';
export interface MobileBinding extends BindingBase {
    /**
     * This is app setting name that specifies the API Key for your Mobile App.
     */
    apiKey?: string;
    /**
     * This is the app setting name that specifies the URL of your Mobile App.
     */
    connection?: string;
    /**
     * This is the name of the table within your Mobile App to which data will be written.
     */
    tableName?: string;
    type: MobileBindingType;
    direction: ServiceBusBindingDirection;
    /**
     * This is the id for the record to retrieve.
     */
    id?: string;
}
export declare type MobileBindingType = 'mobileTable';
export interface DocumentDBBinding extends BindingBase {
    /**
     * This is the name of the collection within your database to which data will be written.
     */
    collectionName?: string;
    /**
     * This is the connection string for your DocumentDB account.
     */
    connection?: string;
    /**
     * This is the name of the database within your DocumentDB account to which data will be
     * written.
     */
    databaseName?: string;
    type: DocumentDBBindingType;
    direction: ServiceBusBindingDirection;
    /**
     * This is the id for the record to retrieve.
     */
    id?: string;
    /**
     * This is the query to run against the collection.
     */
    sqlQuery?: string;
    /**
     * When true, your database and collection will be created automatically.
     */
    createIfNotExists?: boolean;
}
export declare type DocumentDBBindingType = 'documentDB';
export interface TableBinding extends BindingBase {
    /**
     * An app setting (or environment variable) with the storage connection string to be used by
     * this binding.
     */
    connection?: string;
    /**
     * The partition key.
     */
    partitionKey?: string;
    /**
     * The table row key.
     */
    rowKey?: string;
    /**
     * The name of the storage table.
     */
    tableName?: string;
    type: TableBindingType;
    direction: ServiceBusBindingDirection;
    /**
     * A filter expression to be applied when retrieving rows.
     */
    filter?: string;
    /**
     * The number or records to retrieve.
     */
    take?: string;
}
export declare type TableBindingType = 'table';
export interface NotificationHubBinding extends BindingBase {
    /**
     * The name of the app setting which contains the notification hub connection string.
     */
    connection?: string;
    direction: NotificationHubBindingDirection;
    /**
     * The name of the notification hub.
     */
    hubName?: string;
    /**
     * The notification platform to target. Sends template notification if platform is omitted.
     */
    platform?: Platform;
    /**
     * The tag to send the notification to.
     */
    tagExpression?: string;
    type: NotificationHubBindingType;
}
export declare type NotificationHubBindingDirection = 'out';
/**
 * The notification platform to target. Sends template notification if platform is omitted.
 */
export declare type Platform = 'adm' | 'apns' | 'gcm' | 'mpns' | 'wns';
export declare type NotificationHubBindingType = 'notificationHub';
export interface TwilioSMSBinding extends BindingBase {
    /**
     * The name of the app setting which contains your Twilio Account Sid.
     */
    accountSid?: string;
    /**
     * The name of the app setting which contains your Twilio authentication token.
     */
    authToken?: string;
    /**
     * Optional body of SMS text message.
     */
    body?: string;
    direction: NotificationHubBindingDirection;
    /**
     * The phone number the SMS text is sent from.
     */
    from?: string;
    /**
     * The phone number the SMS text is sent to.
     */
    to?: string;
    type: TwilioSMSBindingType;
}
export declare type TwilioSMSBindingType = 'twilioSms';
export interface SendGridBinding extends BindingBase {
    /**
     * The name of the app setting which contains your SendGrid api key.
     */
    apiKey?: string;
    direction: NotificationHubBindingDirection;
    /**
     * The email address to send from.
     */
    from?: string;
    /**
     * The subject of the email.
     */
    subject?: string;
    /**
     * The text of the email.
     */
    text?: string;
    /**
     * The email address to send to.
     */
    to?: string;
    type: SendGridBindingType;
}
export declare type SendGridBindingType = 'sendGrid';
export declare type AzureFunctionBindings = ServiceBusBinding | BlobBinding | ManualTriggerBinding | EventHubBinding | TimerTriggerBinding | QueueBinding | HTTPBinding | MobileBinding | DocumentDBBinding | TableBinding | NotificationHubBinding | TwilioSMSBinding | SendGridBinding;
