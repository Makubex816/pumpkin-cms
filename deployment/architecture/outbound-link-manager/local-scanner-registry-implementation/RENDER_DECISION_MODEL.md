# Render Decision Model

Each render decision contains:

- `tenant_id`
- `site_id`
- `page_id`
- `instance_id`
- `outbound_link_id`
- `original_url`
- `normalized_url`
- `domain`
- `anchor_text`
- `link_status`
- `instance_status`
- `policy_status`
- `render_action`
- `rendered_output`
- `reason_code`
- `safe_rel`
- `safe_target`

Supported render actions:

- `active_anchor`
- `plain_text`
- `hidden`
- `disabled_span`
- `fallback_anchor`
- `pending_review_plain_text`
- `domain_blocked_plain_text`

The model is local JSON only. It is designed to become a future contract for production renderer integration, not to perform that integration in this phase.
