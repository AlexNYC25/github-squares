import { UserContributions } from "./github.type";

export type GithubContributionsResponse = {
	data: UserContributions;
	errors: { message: string }[];
};