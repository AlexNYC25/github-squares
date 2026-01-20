import { 
	GithubContributionsResponse, 
	ContributionCalendar 
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

	const toDate = new Date();
	toDate.setHours(23, 59, 59, 999);
	const fromDate = new Date();
	fromDate.setDate(fromDate.getDate() - daysBack);
	fromDate.setHours(0, 0, 0, 0);

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
				from: fromDate.toISOString(),
				to: toDate.toISOString(),
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