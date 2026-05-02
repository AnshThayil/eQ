from datetime import date, timedelta

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Ascent, Boulder, Gym, Wall


class LatestAscentsViewTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(username='climber', password='pass1234')
		self.setter = User.objects.create_user(username='setter', password='pass1234')
		self.gym = Gym.objects.create(name='eQ Test Gym')
		self.wall = Wall.objects.create(gym=self.gym, name='Zone 1')
		self.url = reverse('latest-ascents')

	def create_ascent(self, index: int):
		boulder = Boulder.objects.create(
			wall=self.wall,
			setter=self.setter,
			setter_grade=f'L{(index % 8) + 1}',
			color=f'color-{index}',
			difficulty='medium',
			climbing_style='power',
			is_active=True,
		)
		ascent = Ascent.objects.create(
			climber=self.user,
			boulder=boulder,
			ascent_type='flash' if index % 2 == 0 else 'send',
			perceived_difficulty='easy',
			liked=True,
			points=10,
		)
		Ascent.objects.filter(pk=ascent.pk).update(date_climbed=date(2026, 1, 1) + timedelta(days=index))
		return ascent.id

	def test_latest_ascents_requires_authentication(self):
		response = self.client.get(self.url)

		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

	def test_latest_ascents_returns_latest_50_in_descending_order(self):
		ascent_ids = [self.create_ascent(index) for index in range(55)]
		self.client.force_authenticate(user=self.user)

		response = self.client.get(self.url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data['ascents']), 50)
		self.assertEqual(
			[item['id'] for item in response.data['ascents']],
			list(reversed(ascent_ids[-50:])),
		)

		first_item = response.data['ascents'][0]
		self.assertEqual(first_item['climber_details']['username'], self.user.username)
		self.assertEqual(first_item['wall_name'], self.wall.name)
		self.assertEqual(first_item['gym_name'], self.gym.name)
		self.assertEqual(first_item['boulder_difficulty'], 'Medium')
		self.assertEqual(first_item['boulder_climbing_style'], 'Power')


class BoulderAscentViewTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(username='climber', password='pass1234')
		self.setter = User.objects.create_user(username='setter', password='pass1234')
		self.gym = Gym.objects.create(name='eQ Test Gym')
		self.wall = Wall.objects.create(gym=self.gym, name='Zone 1')
		self.boulder = Boulder.objects.create(
			wall=self.wall,
			setter=self.setter,
			setter_grade='L4',
			color='blue',
			difficulty='medium',
			climbing_style='power',
			is_active=True,
		)
		self.url = reverse('boulder-ascent', kwargs={'pk': self.boulder.id})

	def test_create_ascent_persists_perceived_difficulty(self):
		self.client.force_authenticate(user=self.user)

		response = self.client.post(
			self.url,
			{'ascent_type': 'flash', 'difficulty': 'Hard', 'liked': False},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['ascent']['perceived_difficulty'], 'hard')
		self.assertFalse(response.data['ascent']['liked'])

		ascent = Ascent.objects.get(climber=self.user, boulder=self.boulder)
		self.assertEqual(ascent.perceived_difficulty, 'hard')
		self.assertFalse(ascent.liked)

	def test_create_ascent_requires_difficulty(self):
		self.client.force_authenticate(user=self.user)

		response = self.client.post(self.url, {'ascent_type': 'flash', 'liked': True}, format='json')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(response.data['detail'], 'Missing or invalid difficulty.')

	def test_create_ascent_requires_liked(self):
		self.client.force_authenticate(user=self.user)

		response = self.client.post(self.url, {'ascent_type': 'flash', 'difficulty': 'Hard'}, format='json')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(response.data['detail'], 'Missing or invalid liked.')

	def test_create_ascent_requires_boolean_liked(self):
		self.client.force_authenticate(user=self.user)

		response = self.client.post(
			self.url,
			{'ascent_type': 'flash', 'difficulty': 'Hard', 'liked': 'true'},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(response.data['detail'], 'Missing or invalid liked.')
