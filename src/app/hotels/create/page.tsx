import { redirect } from "next/navigation";
import { checkUser } from "@/lib/checkUser";
import CreateHotelForm from "@/components/hotels/CreateHotelForm";

export default async function CreateHotelPage() {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <CreateHotelForm />
    </div>
  );
}
