export const fetchServices = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${baseUrl}/api/cms/services/`);
  console.log(baseUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch services");
  }
  return response.json();
};
