import { 
	GithubContributionsResponse, 
	ContributionCalendar, 
	ContributionDays
} from "../types/index";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const contributionsQuery = `
	query ($login: String!, $from: DateTime!, $to: DateTime!) {
		user(login: $login) {
			contributionsCollection(from: $from, to: $to) {
				contributionCalendar {
					totalContributions
					weeks {
						contributionDays {
							date
							contributionCount
							color
						}
					}
				}
			}
		}
	}
`;

export const fetchContributions = async (
	username: string,
	token: string,
	daysBack: number = 0
): Promise<ContributionCalendar> => {
	if (!username) {
		throw new Error("GitHub username is required");
	}
	if (!token) {
		throw new Error("GitHub token is required");
	}

	const todaysDate = new Date();
	const todaysDateOneYearAgo = new Date(todaysDate);
	todaysDateOneYearAgo.setFullYear(todaysDateOneYearAgo.getFullYear() - 1);

	const response = await fetch(GITHUB_GRAPHQL_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			query: contributionsQuery,
			variables: {
				login: username,
				from: todaysDateOneYearAgo.toISOString(),
				to: todaysDate.toISOString(),
			},
		}),
	});

	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
	}

	const data: GithubContributionsResponse = await response.json() as GithubContributionsResponse;

	if (data.errors) {
		throw new Error(`GitHub API error: ${data.errors.map((err: any) => err.message).join(", ")}`);
	}

	return data.data.user.contributionsCollection.contributionCalendar;
}

export const findTheCorrectDay = (
	calender: ContributionCalendar,
	daysBack: number
): ContributionDays => {
	const today = new Date();
	today.setHours(0, 0, 0, 0); // Normalize to midnight

	const targetDate = new Date(today);
	targetDate.setDate(today.getDate() - daysBack);

	const targetDateString = targetDate.toISOString().split('T')[0];

	for (const week of calender.weeks) {
		for (const day of week.contributionDays) {
			if (day.date === targetDateString) {
				return day;
			}
		}
	}

	return { date: '', contributionCount: 0, color: '#ebedf0' }; // Default if not found
}