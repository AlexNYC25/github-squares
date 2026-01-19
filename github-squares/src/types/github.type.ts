
export type ContributionDays = {
	date: string;
	contributionCount: number;
	color: string;
}

export type ContributionCalendar = {
	totalContributions: number;
	weeks: {
		contributionDays: ContributionDays[];
	}[];
}

export type ContributionsCollection = {
	contributionCalendar: ContributionCalendar;
}

export type UserContributions = {
	user: {
		contributionsCollection: ContributionsCollection;
	};
}