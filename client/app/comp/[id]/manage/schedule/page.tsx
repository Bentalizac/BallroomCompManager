export default function Schedule() {
    return (
        <main className="flex flex-row" style={{ height: "calc(100vh - 64px)" }}>
            <div className="p-4 w-64 border-r">
                <div className="flex justify-between items-center pb-4">
                    <h1 className="text-xl">Events</h1>
                    <span className="text-2xl">+</span>
                </div>
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-lg">Latin</h2>
                        <ul className="flex flex-col gap-1">
                            <li className="border rounded px-1 flex justify-between">
                                <span>Amateur Latin</span>
                                <span>: :</span>
                            </li>
                            <li className="border rounded px-1 flex justify-between">
                                <span>Pre-Champ Latin</span>
                                <span>: :</span>
                            </li>
                            <li className="border rounded px-1 flex justify-between">
                                <span>Champ Latin</span>
                                <span>: :</span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-lg">Ballroom</h2>
                        <ul className="flex flex-col gap-1">
                            <li className="border rounded px-1 flex justify-between">
                                <span>Amateur Ballroom</span>
                                <span>: :</span>
                            </li>
                            <li className="border rounded px-1 flex justify-between">
                                <span>Pre-Champ Ballroom</span>
                                <span>: :</span>
                            </li>
                            <li className="border rounded px-1 flex justify-between">
                                <span>Champ Ballroom</span>
                                <span>: :</span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-lg">Other</h2>
                        <ul className="flex flex-col gap-1">
                            <li className="border rounded px-1 flex justify-between">
                                <span>Formation</span>
                                <span>: :</span>
                            </li>
                            <li className="border rounded px-1 flex justify-between">
                                <span>Cabaret</span>
                                <span>: :</span>
                            </li>
                        </ul>
                    </div>
                    
                </div>
            </div>

            <div className="flex-1 p-4">
                <h1 className="text-xl text-center">Schedule</h1>
                <div className="flex gap-2">
                    <div className="flex flex-col w-12 border gap-4">
                        <div>8:00</div>
                        <div>8:30</div>
                        <div>9:00</div>
                        <div>9:30</div>
                        <div>10:00</div>
                        <div>10:30</div>
                        <div>11:00</div>
                        <div>11:30</div>
                        <div>12:00</div>
                        <div>12:30</div>
                        <div>1:00</div>
                        <div>1:30</div>
                        <div>2:00</div>
                        <div>2:30</div>
                        <div>3:00</div>
                        <div>3:30</div>
                        <div>4:00</div>
                        <div>4:30</div>
                        <div>5:00</div>
                        <div>5:30</div>
                        <div>6:00</div>
                        <div>6:30</div>
                        <div>7:00</div>
                        <div>7:30</div>
                        <div>8:00</div>
                        <div>8:30</div>
                        <div>9:00</div>
                        <div>9:30</div>
                        <div>10:00</div>
                        <div>10:30</div>
                    </div>
                    <div className="flex flex-row gap-2 w-full">
                        <div className="flex flex-col w-full border">
                            <h2 className="text-lg border-b">10/9</h2>
                            <div>
                                schedule
                            </div>
                        </div>
                        <div className="flex flex-col w-full border">
                            <h2 className="text-lg border-b">10/9</h2>
                            <div>
                                schedule
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col p-4 w-64 border-l">
                <div className="flex flex-col h-full">
                    <div className="flex-1">
                        <h1 className="text-xl pb-4">Conflicts</h1>
                        <ul>
                            <li>Conflict A</li>
                            <li>Conflict B</li>
                            <li>Conflict C</li>
                        </ul>
                    </div>
                    <div className="flex-1 border-t">
                        <h1 className="text-xl pb-4 pt-2">Selected Event</h1>
                        <div>
                            <div>Name:</div>
                            <div>Description:</div>
                            <div>Type:</div>
                            <div>Scheduled Time:</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}