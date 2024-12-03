import { faker } from '@faker-js/faker'
import { Category, Comment, Post, PrismaClient, User } from '@prisma/client'
import { hash } from 'argon2'
import * as dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

// password: 12345678
async function createAdmin(): Promise<User> {
	return prisma.user.create({
		data: {
			login: 'admin',
			password: await hash('12345678'),
			fullname: 'Admin Admin',
			email: 'admin@example.com',
			avatarPath: process.env.AWS_DEFAULT_IMAGE_URL || 'default_avatar.png',
			role: 'ADMIN',
			rating: 5000,
			isConfirm: true,
			confirmToken: null,
			postsCount: 100,
			commentsCount: 100,
			reactionsCount: 200
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
					avatarPath: process.env.AWS_DEFAULT_IMAGE_URL || 'default_avatar.png',
					role: 'USER',
					rating: faker.number.int({ min: 500, max: 5000 }),
					isConfirm: true,
					confirmToken: null,
					postsCount: faker.number.int({ min: 50, max: 100 }),
					commentsCount: faker.number.int({ min: 50, max: 100 }),
					reactionsCount: faker.number.int({ min: 100, max: 200 })
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
		Array.from({ length: 200 }).map(async () => {
			const author = users[Math.floor(Math.random() * users.length)]
			const post = await prisma.post.create({
				data: {
					publishAt: faker.date.past(),
					status: faker.helpers.arrayElement(['ACTIVE', 'INACTIVE']),
					title: faker.lorem.words(5),
					content: faker.lorem.paragraphs(5),
					authorId: author.id,
					rating: faker.number.int({ min: 50, max: 200 })
				}
			})

			await prisma.user.update({
				where: { id: author.id },
				data: {
					postsCount: { increment: 1 }
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
			Array.from({ length: faker.number.int({ min: 5, max: 15 }) }).map(
				async () => {
					const author = users[Math.floor(Math.random() * users.length)]
					const comment = await prisma.comment.create({
						data: {
							content: faker.lorem.sentence().slice(0, 255),
							publishAt: faker.date.recent(),
							authorId: author.id,
							postId: post.id,
							rating: faker.number.int({ min: 10, max: 50 })
						}
					})

					await prisma.user.update({
						where: { id: author.id },
						data: {
							commentsCount: { increment: 1 }
						}
					})

					return comment
				}
			)
		)
	)
}

async function createPostLikes(users: User[], posts: Post[]) {
	for (const post of posts) {
		for (const _ of Array.from({
			length: faker.number.int({ min: 5, max: 20 })
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

				await prisma.user.update({
					where: { id: user.id },
					data: {
						reactionsCount: { increment: 1 }
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
			length: faker.number.int({ min: 5, max: 15 })
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

				await prisma.user.update({
					where: { id: user.id },
					data: {
						reactionsCount: { increment: 1 }
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

async function main() {
	await createAdmin()
	const users = await createUsers()
	const categories = await createCategories()
	const posts = await createPosts(users, categories)
	const comments = await createComments(users, posts)
	await createPostLikes(users, posts)
	await createCommentLikes(users, comments)
	console.log(
		'Seed data created with high-rating users and abundant posts/comments.'
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
