
async function testChatTools() {
    const API_URL = "http://localhost:3000/api/chat";
    const projectId = "jd7frw02xcfxzzththa0yvcdc185zj3h"; // Taken from your logs

    console.log("🚀 STARTING TOOL TESTS...\n");

    // TEST 1: Document Search (Web Search OFF)
    console.log("--- TEST 1: SEARCHING DOCUMENTS ONLY (Web Search: OFF) ---");
    try {
        const res1 = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId,
                webSearchEnabled: false,
                messages: [{ role: 'user', content: "What are the core pillars of Content Nova?" }]
            })
        });
        const data1 = await res1.json();
        console.log("AI Response:", data1.message.content);
        console.log("Citations:", data1.message.citations);
        console.log("-----------------------------------\n");
    } catch (e) {
        console.error("Test 1 Failed:", e.message);
    }

    // TEST 2: Web Search (Web Search ON)
    console.log("--- TEST 2: SEARCHING WEB (Web Search: ON) ---");
    try {
        const res2 = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId,
                webSearchEnabled: true,
                messages: [{ role: 'user', content: "Who is currently leading the English Premier League table right now?" }]
            })
        });
        const data2 = await res2.json();
        console.log("AI Response:", data2.message.content);
        console.log("Citations:", data2.message.citations);
        console.log("-----------------------------------\n");
    } catch (e) {
        console.error("Test 2 Failed:", e.message);
    }
}

testChatTools();
