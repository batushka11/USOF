import { faker } from '@faker-js/faker'
import { Category, Comment, Post, PrismaClient, User } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

async function createUsers(): Promise<User[]> {
	return Promise.all(
		Array.from({ length: 20 }).map(() =>
			prisma.user.create({
				data: {
					login: faker.internet.userName(),
					password: faker.internet.password(),
					fullname: faker.person.fullName(),
					email: faker.internet.email(),
					avatarPath: 'default_avatar.png',
					role: 'USER',
					rating: faker.number.int({ min: 0, max: 100 }),
					isConfirm: true,
					confirmToken: null
				}
			})
		)
	)
}

async function createCategories(): Promise<Category[]> {
	return Promise.all(
		Array.from({ length: 10 }).map(() =>
			prisma.category.create({
				data: {
					title: faker.lorem.word(),
					description: faker.lorem.sentence()
				}
			})
		)
	)
}

async function createPosts(
	users: User[],
	categories: Category[]
): Promise<Post[]> {
	return Promise.all(
		Array.from({ length: 20 }).map(async () => {
			const post = await prisma.post.create({
				data: {
					publishAt: faker.date.past(),
					status: 'ACTIVE',
					title: faker.lorem.words({ min: 10, max: 30 }),
					content: faker.lorem.paragraph({ min: 5, max: 10 }),
					authorId: users[Math.floor(Math.random() * users.length)].id
				}
			})

			const selectedCategories = faker.helpers.arrayElements(
				categories,
				faker.number.int({ min: 1, max: 3 })
			)
			await Promise.all(
				selectedCategories.map((category: Category) =>
					prisma.postCategory.create({
						data: {
							postId: post.id,
							categoryId: category.id
						}
					})
				)
			)

			return post
		})
	)
}

async function createComments(
	users: User[],
	posts: Post[]
): Promise<Comment[]> {
	return Promise.all(
		posts.flatMap(post =>
			Array.from({ length: faker.number.int({ min: 1, max: 5 }) }).map(() =>
				prisma.comment.create({
					data: {
						content: faker.lorem.sentence().slice(0, 255),
						publishAt: faker.date.recent(),
						authorId: users[Math.floor(Math.random() * users.length)].id,
						postId: post.id
					}
				})
			)
		)
	)
}

async function createPostLikes(users: User[], posts: Post[]) {
	for (const post of posts) {
		for (const _ of Array.from({
			length: faker.number.int({ min: 1, max: 10 })
		})) {
			const user = users[Math.floor(Math.random() * users.length)]
			const existingLike = await prisma.like.findUnique({
				where: { postId_authorId: { postId: post.id, authorId: user.id } }
			})
			if (!existingLike) {
				await prisma.like.create({
					data: {
						type: faker.helpers.arrayElement(['LIKE', 'DISLIKE']),
						publishAt: faker.date.recent(),
						authorId: user.id,
						postId: post.id
					}
				})
			}
		}
	}
}

async function createCommentLikes(users: User[], comments: Comment[]) {
	for (const comment of comments) {
		for (const _ of Array.from({
			length: faker.number.int({ min: 1, max: 5 })
		})) {
			const user = users[Math.floor(Math.random() * users.length)]
			const existingLike = await prisma.like.findUnique({
				where: {
					commentId_authorId: { commentId: comment.id, authorId: user.id }
				}
			})
			if (!existingLike) {
				await prisma.like.create({
					data: {
						type: faker.helpers.arrayElement(['LIKE', 'DISLIKE']),
						publishAt: faker.date.recent(),
						authorId: user.id,
						commentId: comment.id
					}
				})
			}
		}
	}
}

async function main() {
	const users = await createUsers()
	const categories = await createCategories()
	const posts = await createPosts(users, categories)
	const comments = await createComments(users, posts)
	await createPostLikes(users, posts)
	await createCommentLikes(users, comments)
	console.log(
		'Seed data created: 20 users, 20 posts, categories, comments, and likes.'
	)
}

main()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
