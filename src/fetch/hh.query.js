function buildHHVacanciesPath({
  page = 0,
  excluded_text,
  text,                  // дополнительный текст поиска
  area,
  workFormat,            // REMOTE | HYBRID | OFFICE
  employmentForm,        // FULL | PART_TIME | PROJECT
  professionalRole,      // role ID, например 96
  industry,              // industry ID
  education,             // education filter
} = {}) {
  const params = new URLSearchParams();

  params.set("page", page);

  // фильтровать сразу по полям поиска
  params.append("search_field", "name");
  params.append("search_field", "company_name");
  params.append("search_field", "description");

  params.set("enable_snippets", "true");
  params.set("L_save_area", "true");

  if (excluded_text) params.set("excluded_text", excluded_text);
  if (text) params.set("text", text);

  if (area) params.set("area", area);

  if (workFormat) params.set("work_format", workFormat);
  if (employmentForm) params.set("employment_form", employmentForm);

  if (professionalRole) params.set("professional_role", professionalRole);
  if (industry) params.set("industry", industry);
  if (education) params.set("education", education);

  return `/search/vacancy?${params.toString()}`;
}

module.exports = { buildHHVacanciesPath };
