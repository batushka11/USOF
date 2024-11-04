import { faker } from '@faker-js/faker'
import { Category, Comment, Post, PrismaClient, User } from '@prisma/client'
import { hash } from 'argon2'
import * as dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

//password:12345678
async function createAdmin(): Promise<User> {
	return prisma.user.create({
		data: {
			login: 'batushka_admin',
			password: await hash('12345678'),
			fullname: 'Andrii Zhupanov',
			email: 'zhupanovandrey05@gmail.com',
			avatarPath: process.env.DEFAULT_AVATAR_PATH || 'default_avatar.png',
			role: 'ADMIN',
			rating: 0,
			isConfirm: true,
			confirmToken: null
		}
	})
}

async function createUsers(): Promise<User[]> {
	return Promise.all(
		Array.from({ length: 20 }).map(async () =>
			prisma.user.create({
				data: {
					login: faker.internet.userName(),
					password: await hash(faker.internet.password()),
					fullname: faker.person.fullName(),
					email: faker.internet.email(),
					avatarPath: process.env.DEFAULT_AVATAR_PATH || 'default_avatar.png',
					role: 'USER',
					rating: 0,
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
					title: faker.word.noun({ length: { min: 4, max: 8 } }),
					description: faker.lorem.words(3)
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
					status: faker.helpers.arrayElement(['ACTIVE', 'INACTIVE']),
					title: faker.lorem.words(2),
					content: faker.lorem.paragraph(),
					authorId: users[Math.floor(Math.random() * users.length)].id
				}
			})

			const selectedCategories = faker.helpers.arrayElements(
				categories,
				faker.number.int({ min: 2, max: 4 })
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
				const likeType = faker.helpers.arrayElement(['LIKE', 'DISLIKE'])
				await prisma.like.create({
					data: {
						type: likeType,
						publishAt: faker.date.recent(),
						authorId: user.id,
						postId: post.id
					}
				})
				await prisma.post.update({
					where: { id: post.id },
					data: {
						rating: {
							increment: likeType === 'LIKE' ? 1 : -1
						}
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
				const likeType = faker.helpers.arrayElement(['LIKE', 'DISLIKE'])
				await prisma.like.create({
					data: {
						type: likeType,
						publishAt: faker.date.recent(),
						authorId: user.id,
						commentId: comment.id
					}
				})
				await prisma.comment.update({
					where: { id: comment.id },
					data: {
						rating: {
							increment: likeType === 'LIKE' ? 1 : -1
						}
					}
				})
			}
		}
	}
}

async function updateUserRatings(users: User[]) {
	for (const user of users) {
		const postLikes = await prisma.like.count({
			where: { post: { authorId: user.id }, type: 'LIKE' }
		})
		const postDislikes = await prisma.like.count({
			where: { post: { authorId: user.id }, type: 'DISLIKE' }
		})

		const commentLikes = await prisma.like.count({
			where: { comment: { authorId: user.id }, type: 'LIKE' }
		})
		const commentDislikes = await prisma.like.count({
			where: { comment: { authorId: user.id }, type: 'DISLIKE' }
		})

		const rating = postLikes - postDislikes + (commentLikes - commentDislikes)

		await prisma.user.update({
			where: { id: user.id },
			data: { rating }
		})
	}
}

async function main() {
	await createAdmin()
	const users = await createUsers()
	const categories = await createCategories()
	const posts = await createPosts(users, categories)
	const comments = await createComments(users, posts)
	await createPostLikes(users, posts)
	await createCommentLikes(users, comments)
	await updateUserRatings(users)
	console.log(
		'Seed data created: 20 users, 20 posts with random statuses, categories, comments, and likes.'
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
