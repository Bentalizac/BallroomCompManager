import { Banner } from "@/components/custom/banner";

export default function Contact() {

    return (
        <>
            <Banner name="Contact" />
            <div className="max-w-4xl mx-auto my-8 px-4">
                <div className="bg-white rounded-lg shadow p-8 flex flex-col md:flex-row gap-8">
                    {/* Contact Info */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                        <ul className="text-gray-700 mb-6">
                            <li><span className="font-semibold">Email:</span> info@ballroomcomp.com</li>
                            <li><span className="font-semibold">Phone:</span> (555) 123-4567</li>
                            <li><span className="font-semibold">Location:</span> Grand Ballroom, City Center</li>
                        </ul>
                        <div className="bg-gray-100 rounded p-4 text-sm text-gray-600">
                            For urgent matters during the event, please visit the organizer desk or call the number above.
                        </div>
                    </div>
                    {/* Contact Form */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-4">Send Us a Message</h2>
                        <form className="flex flex-col gap-4">
                            <input type="text" placeholder="Your Name" className="border rounded px-4 py-2" />
                            <input type="email" placeholder="Your Email" className="border rounded px-4 py-2" />
                            <textarea placeholder="Your Message" rows={4} className="border rounded px-4 py-2" />
                            <button type="submit" className="bg-purple-700 text-white px-6 py-2 rounded hover:bg-purple-800 font-semibold">Send Message</button>
                        </form>
                    </div>
                </div>
                {/* Map/Location */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-2">Event Location</h2>
                    <div className="w-full h-64 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                        [Map Placeholder]
                    </div>
                </div>
            </div>
        </>
    );
}