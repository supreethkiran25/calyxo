async function test() {
  const urls = [
    `https://wger.de/api/v2/exercise/search/?term=squat`,
    `https://wger.de/api/v2/exercise-search/?term=squat`,
    `https://wger.de/api/v2/exercise/?search=squat`,
    `https://wger.de/api/v2/exerciseinfo/?search=squat`,
    `https://wger.de/api/v2/exercise/?name__icontains=squat`
  ];
  for (const url of urls) {
    const res = await fetch(url);
    if (res.ok) {
        const data = await res.json();
        console.log(`\n--- ${url} SUCCESS ---`);
        if(data.results && data.results.length > 0) {
            console.log(data.results[0]);
        }
    } else {
        console.log(`\n--- ${url} FAILED ${res.status} ---`);
    }
  }
}
test();
