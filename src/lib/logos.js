// Provider logos for model names (public/logos, from the MIT-licensed LobeHub
// icon set). Organisations without a mark there get a lettered tile instead of
// an invented logo.
const BY_FAMILY = { Gemma: "gemma-color", Claude: "claude-color" };
const BY_ORG = {
  Alibaba: "qwen-color",
  DeepSeek: "deepseek-color",
  Google: "google-color",
  "Hugging Face": "huggingface-color",
  Meta: "meta-color",
  Microsoft: "microsoft-color",
  "Mistral AI": "mistral-color",
  NVIDIA: "nvidia-color",
  OpenAI: "openai",
  Anthropic: "claude-color",
};
const MONO = new Set(["openai"]);
const INITIALS = { IBM: "IBM", Ai2: "Ai2", "Swiss AI": "SAI", Artigenz: "Ar", BigScience: "BS", "KIT (ArDoCo)": "KIT" };

export function logoFor(model) {
  const file = BY_FAMILY[model?.family] ?? BY_ORG[model?.org];
  if (file) return { src: `/logos/${file}.svg`, mono: MONO.has(file), org: model?.org };
  const org = model?.org ?? model?.display_name ?? "?";
  return { initials: INITIALS[org] ?? org.replace(/[^A-Za-z0-9]/g, "").slice(0, 2), org };
}
