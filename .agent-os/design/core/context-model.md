# Design Context Model

Design context is stored in `memory/design_context.yaml` and should be treated as the
first-class input for all design skills. Do not infer user goals or brand tone from code alone.

Minimum required context fields:
- Product purpose
- Target users and usage context
- Brand personality and tone
- Design principles (3-5)
- Interaction preferences and platform constraints
- Accessibility expectations
- Visual style direction
- Motion philosophy
- Content tone and UX writing constraints
- Differentiation goals

If context is missing, a design skill must request it and then update `memory/design_context.yaml`.
