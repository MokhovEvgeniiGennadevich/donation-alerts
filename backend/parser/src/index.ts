console.log('Hello world! 111 333 555')

type configType = {
	TOKEN: string
	TIMEOUT: number
	DATABASE: string
}

let config: configType = {
	TOKEN: '',
	TIMEOUT: 0,
	DATABASE: 'donations.json',
}

if (!process.env.TOKEN) {
	console.log('Config: TOKEN: Not set in ENV file')
	process.exit()
} else {
	config.TOKEN = process.env.TOKEN
}

if (!process.env.TIMEOUT) {
	console.log('Config: TIMEOUT: Not set in ENV file')
	process.exit()
} else {
	console.log('Config: TIMEOUT:', process.env.TIMEOUT)
	config.TIMEOUT = parseInt(process.env.TIMEOUT)
}

// Load donations from `donations.json`

const fs = require('fs')

let donations: any[] = []

if (fs.existsSync(config.DATABASE)) {
	const file = fs.readFileSync(config.DATABASE)

	donations = JSON.parse(file.toString())
}

console.log('Donations Loaded:', donations.length)

let count = 0

let parseDonationsPages = 1

const parseDonationsUrl =
	'https://www.donationalerts.com/api/v1/alerts/donations?page='

// async funciton so we can 'await' a promise and not have to use callbacks
const main = async () => {
	for (let i = 1; i <= parseDonationsPages; i++) {
		const url = parseDonationsUrl + i.toString()

		console.log('Parsing: Donations Page:', i)

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${config.TOKEN}`,
			},
		})

		const json: any = await response.json()

		parseDonationsPages = json.meta.last_page

		// New donation is added
		let isAdded = false

		// Переносим спаршенные донаты в базу
		for (const donation of json.data) {
			if (!donations.find(x => x.id === donation.id)) {
				donations.push(donation)

				isAdded = true
			}
		}

		// Если ничего не добавлено нового то мы прерываем работу
		if (isAdded) {
			// Сохраняем результат в файл
			fs.writeFileSync(config.DATABASE, JSON.stringify(donations))
		} else {
			// Прерываем работу, ничего нового нет
			i = parseDonationsPages + 2000
		}

		// timeout so we don't get rate limited
		setTimeout(() => {}, 2000)
	}

	// send our web request and print out the result
	console.log('Server is running. Count: ' + count)

	count++

	console.log('Donations Loaded:', donations.length)

	// after 1 second, call this function again
	setTimeout(main, config.TIMEOUT * 60 * 1000)
}

main()
