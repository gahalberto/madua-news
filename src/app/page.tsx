"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  slug: string;
  author: {
    name: string;
    image: string;
  };
  category: {
    name: string;
  };
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  promotionalPrice: number | null;
  teacher: {
    name: string;
    image: string;
  };
  category: {
    name: string;
  };
}

interface Ebook {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  price: number;
  promotionalPrice: number | null;
  category: {
    name: string;
  };
}

export default function Home() {
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [featuredEbooks, setFeaturedEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar posts
        const postsResponse = await fetch('/api/posts/featured');
        const postsData = await postsResponse.json();
        console.log('Post em destaque:', postsData.featuredPost);
        setFeaturedPost(postsData.featuredPost);
        setRecentPosts(postsData.recentPosts);

        // Buscar cursos
        const coursesResponse = await fetch('/api/courses/featured');
        const coursesData = await coursesResponse.json();
        setFeaturedCourses(coursesData);

        // Buscar e-books
        const ebooksResponse = await fetch('/api/ebooks/featured');
        const ebooksData = await ebooksResponse.json();
        setFeaturedEbooks(ebooksData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  console.log('Renderizando post em destaque:', featuredPost);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section com Post em Destaque */}
      {featuredPost && (
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-blue-400 font-semibold mb-4 block">Destaque da Semana</span>
                <Link href={`/noticias/${featuredPost.slug}`}>
                  <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight hover:text-blue-400 transition-colors">
                    {featuredPost.title}
                  </h1>
                </Link>
                <p className="text-xl text-gray-300 mb-8">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center space-x-4">
                  <Image 
                    src={featuredPost.author.image || "/images/placeholder-author.jpg"} 
                    alt={featuredPost.author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/placeholder-author.jpg";
                    }}
                  />
                  <div>
                    <p className="font-medium">{featuredPost.author.name}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(featuredPost.createdAt).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/noticias/${featuredPost.slug}`}
                  className="mt-8 inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ler Mais
                </Link>
              </div>
              <Link href={`/noticias/${featuredPost.slug}`} className="block relative w-full h-[400px] rounded-xl overflow-hidden group hover:opacity-90 transition-all duration-300">
                <div className="absolute inset-0">
                  <Image 
                    src={featuredPost.imageUrl || "/images/placeholder-news.jpg"} 
                    alt={`Imagem em destaque: ${featuredPost.title}`}
                    width={800}
                    height={400}
                    priority
                    quality={100}
                    loading="eager"
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/placeholder-news.jpg";
                      console.error('Erro ao carregar imagem:', featuredPost.imageUrl);
                    }}
                  />
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Posts Recentes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Últimos Posts</h2>
            <Link
              href="/noticias"
              className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center"
            >
              Ver Todas
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <Link href={`/noticias/${post.slug}`} key={post.id}>
                <article className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48">
                    <Image 
                      src={post.imageUrl || "/images/placeholder-news.jpg"} 
                      alt={`Imagem do post: ${post.title}`}
                      fill
                      loading="lazy"
                      className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/placeholder-news.jpg";
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                      {post.category.name}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">{post.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Image 
                          src={post.author.image || "/images/placeholder-author.jpg"} 
                          alt={post.author.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/placeholder-author.jpg";
                          }}
                        />
                        <span className="text-sm text-gray-600">{post.author.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cursos em Destaque */}
      {featuredCourses.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold">Cursos em Destaque</h2>
              <Link
                href="/cursos"
                className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center"
              >
                Ver Todos
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image 
                      src={course.imageUrl || "https://via.placeholder.com/400x300"} 
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        {course.promotionalPrice ? (
                          <>
                            <span className="line-through text-gray-400 text-sm mr-2">
                              R$ {course.price.toFixed(2)}
                            </span>
                            <span className="text-blue-600 font-bold">
                              R$ {course.promotionalPrice.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-blue-600 font-bold">
                            R$ {course.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/cursos/${course.id}`}
                        className="text-blue-600 font-medium hover:text-blue-800"
                      >
                        Ver Curso
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* E-books */}
      {featuredEbooks.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold">E-books em Destaque</h2>
              <Link
                href="/ebooks"
                className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center"
              >
                Ver Todos
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredEbooks.map((ebook) => (
                <div key={ebook.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-64 bg-gray-100">
                    <Image 
                      src={ebook.coverImageUrl || "https://via.placeholder.com/400x600"} 
                      alt={ebook.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{ebook.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {ebook.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        {ebook.promotionalPrice ? (
                          <>
                            <span className="line-through text-gray-400 text-sm mr-2">
                              R$ {ebook.price.toFixed(2)}
                            </span>
                            <span className="text-blue-600 font-bold">
                              R$ {ebook.promotionalPrice.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-blue-600 font-bold">
                            R$ {ebook.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/ebooks/${ebook.id}`}
                        className="text-blue-600 font-medium hover:text-blue-800"
                      >
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Fique por dentro das novidades</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
            Receba atualizações sobre as últimas notícias de Israel diretamente no seu e-mail.
          </p>
          <form 
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;

              try {
                const response = await fetch('/api/newsletter', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (!response.ok) {
                  throw new Error(data.error || 'Erro ao processar inscrição.');
                }

                // Limpar o formulário
                form.reset();

                // Mostrar mensagem de sucesso
                toast.success(data.message);
              } catch (error) {
                // Mostrar mensagem de erro
                toast.error(error instanceof Error ? error.message : 'Erro ao processar inscrição.');
              }
            }}
          >
            <input
              type="email"
              name="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Inscrever-se
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">EduPlatform</h3>
              <p className="text-gray-400">
                Transformando vidas através da educação de qualidade desde 2024.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link href="/cursos" className="text-gray-400 hover:text-white">Cursos</Link></li>
                <li><Link href="/ebooks" className="text-gray-400 hover:text-white">E-books</Link></li>
                <li><Link href="/sobre" className="text-gray-400 hover:text-white">Sobre Nós</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2">
                <li><Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
                <li><Link href="/contato" className="text-gray-400 hover:text-white">Contato</Link></li>
                <li><Link href="/termos" className="text-gray-400 hover:text-white">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="text-gray-400 hover:text-white">Privacidade</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contato</h4>
              <p className="text-gray-400 mb-2">contato@eduplatform.com</p>
              <p className="text-gray-400">+55 (11) 99999-9999</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EduPlatform. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
