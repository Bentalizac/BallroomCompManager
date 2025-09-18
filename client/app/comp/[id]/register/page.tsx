import { Banner } from "@/components/custom/banner";

export default function Register() {

    return (
        <>
            <Banner name="Register" />
            <main className="max-w-xl mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold mb-8">Competition Registration</h1>
                <form className="bg-white rounded-lg shadow p-8 flex flex-col gap-6">
                    <input type="text" placeholder="Full Name" className="border rounded px-4 py-2" />
                    <input type="email" placeholder="Email Address" className="border rounded px-4 py-2" />
                    <input type="text" placeholder="Partner Name (if applicable)" className="border rounded px-4 py-2" />
                    <select className="border rounded px-4 py-2">
                        <option value="">Select Event</option>
                        <option value="amateur">Amateur</option>
                        <option value="pro">Professional</option>
                        <option value="pro-am">Pro-Am</option>
                        <option value="youth">Youth/Junior</option>
                    </select>
                    <input type="text" placeholder="NDCA Number (if applicable)" className="border rounded px-4 py-2" />
                    <button type="submit" className="bg-purple-700 text-white px-6 py-2 rounded hover:bg-purple-800 font-semibold">Register</button>
                </form>
            </main>
        </>
    );
}