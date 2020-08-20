use yew::html::ShouldRender;

/// Indicates Yew should trigger a render
pub const RENDER: ShouldRender = true;
/// Indicates Yew should _not_ trigger a render
pub const SKIP_RENDER: ShouldRender = false;
