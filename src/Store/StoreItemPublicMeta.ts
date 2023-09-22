export interface StoreItemPublicMeta {
    price: string;
    image_url: string;
    name: string;
    description: string;
    label_tag: string;
    custom_label_tag?: string;
    limit_message: string;
    priority: number;
    related_items: number[];
    hint_text: string;
}
